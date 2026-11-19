# Análise das leituras: resumo, velocidade de subida e tempo até o nível crítico.
from datetime import timedelta

from faixas import buscar_faixa, classificar_nivel

# Minutos de leituras usados para calcular a velocidade (suaviza o ruído do sensor)
JANELA_PADRAO_MIN = 60

# Abaixo disso (em cm/h) o nível é considerado estável
VELOCIDADE_MINIMA_CM_H = 2.0


# Números gerais da série: quantidade, período, mínimo, máximo e média
def resumo_estatistico(leituras):
    niveis = [leitura.nivel_cm for leitura in leituras]
    return {
        "quantidade": len(leituras),
        "inicio": leituras[0].timestamp,
        "fim": leituras[-1].timestamp,
        "minimo": min(niveis),
        "maximo": max(niveis),
        "media": round(sum(niveis) / len(niveis), 1),
    }


# Quantas leituras caíram em cada faixa de alerta
def contar_por_faixa(leituras, faixas):
    contagem = {faixa["chave"]: 0 for faixa in faixas}
    for leitura in leituras:
        faixa = classificar_nivel(leitura.nivel_cm, faixas)
        contagem[faixa["chave"]] += 1
    return contagem


# Só as leituras até o momento informado ("voltar no tempo")
def leituras_ate(leituras, momento):
    return [leitura for leitura in leituras if leitura.timestamp <= momento]


# Velocidade de subida em cm/h: inclinação da reta de mínimos quadrados da última hora
def velocidade_subida(leituras, janela_min=JANELA_PADRAO_MIN):
    if not leituras:
        return None

    # Pega só as leituras dentro da janela de tempo
    fim = leituras[-1].timestamp
    inicio = fim - timedelta(minutes=janela_min)
    janela = [leitura for leitura in leituras if leitura.timestamp >= inicio]
    if len(janela) < 2:
        return None

    # x = horas desde a primeira leitura da janela; y = nível em cm
    x = [(leitura.timestamp - janela[0].timestamp).total_seconds() / 3600 for leitura in janela]
    y = [leitura.nivel_cm for leitura in janela]

    media_x = sum(x) / len(x)
    media_y = sum(y) / len(y)

    # inclinação = soma((x - média_x)(y - média_y)) / soma((x - média_x)²)
    numerador = sum((xi - media_x) * (yi - media_y) for xi, yi in zip(x, y))
    denominador = sum((xi - media_x) ** 2 for xi in x)
    if denominador == 0:  # todas as leituras no mesmo instante
        return None

    return numerador / denominador


# Traduz a velocidade em palavra: subindo, descendo ou estável
def tendencia(velocidade_cm_h):
    if velocidade_cm_h is None:
        return "sem dados suficientes"
    if velocidade_cm_h >= VELOCIDADE_MINIMA_CM_H:
        return "subindo"
    if velocidade_cm_h <= -VELOCIDADE_MINIMA_CM_H:
        return "descendo"
    return "estável"


# Minutos até o crítico = (limite - nível atual) / velocidade × 60
# 0 = já atingiu; None = a água não está subindo
def minutos_ate_critico(nivel_atual_cm, velocidade_cm_h, limite_critico_cm):
    if nivel_atual_cm >= limite_critico_cm:
        return 0.0
    if velocidade_cm_h is None or velocidade_cm_h < VELOCIDADE_MINIMA_CM_H:
        return None
    falta_cm = limite_critico_cm - nivel_atual_cm
    return falta_cm / velocidade_cm_h * 60


# Junta tudo sobre a última leitura: faixa, velocidade, tendência e tempo até o crítico
def status_atual(leituras, faixas, janela_min=JANELA_PADRAO_MIN):
    ultima = leituras[-1]
    velocidade = velocidade_subida(leituras, janela_min)
    limite_critico = buscar_faixa("critico", faixas)["a_partir_de_cm"]
    return {
        "leitura": ultima,
        "faixa": classificar_nivel(ultima.nivel_cm, faixas),
        "velocidade_cm_h": velocidade,
        "tendencia": tendencia(velocidade),
        "limite_critico_cm": limite_critico,
        "minutos_ate_critico": minutos_ate_critico(ultima.nivel_cm, velocidade, limite_critico),
    }


# Indicador de impacto: minutos entre o primeiro Alerta e a chegada ao Crítico
def calcular_antecedencia(leituras, faixas, faixa_aviso="alerta"):
    codigo_aviso = buscar_faixa(faixa_aviso, faixas)["codigo"]
    codigo_critico = buscar_faixa("critico", faixas)["codigo"]

    momento_aviso = None
    for leitura in leituras:
        codigo = classificar_nivel(leitura.nivel_cm, faixas)["codigo"]
        # Guarda a primeira vez que a água chegou na faixa de aviso
        if momento_aviso is None and codigo >= codigo_aviso:
            momento_aviso = leitura.timestamp
        # Chegou no crítico: calcula a diferença e encerra
        if codigo >= codigo_critico:
            if momento_aviso is None:
                momento_aviso = leitura.timestamp
            minutos = (leitura.timestamp - momento_aviso).total_seconds() / 60
            return {"aviso": momento_aviso, "critico": leitura.timestamp, "minutos": minutos}

    return None  # nunca chegou ao crítico
