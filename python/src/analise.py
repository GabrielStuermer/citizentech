"""
Análise das leituras: resumo, velocidade de subida e tempo até o nível crítico.

É aqui que os dados viram informação para o morador decidir o que fazer:
"a água está subindo a X cm/h; nesse ritmo, chega ao nível crítico em Y minutos".
"""

from datetime import timedelta

from faixas import buscar_faixa, classificar_nivel

# Quantos minutos de leituras usar para calcular a velocidade de subida.
# Uma hora suaviza o ruído do sensor sem demorar muito a perceber a subida.
JANELA_PADRAO_MIN = 60

# Abaixo desta velocidade consideramos que o nível está estável.
# Serve para não confundir o pequeno "tremido" do sensor com subida de verdade.
VELOCIDADE_MINIMA_CM_H = 2.0


def resumo_estatistico(leituras):
    """Calcula números gerais da série de leituras.

    Retorna:
        dict com: quantidade, inicio, fim (datetime), minimo, maximo e media (cm).
    """
    niveis = [leitura.nivel_cm for leitura in leituras]
    return {
        "quantidade": len(leituras),
        "inicio": leituras[0].timestamp,
        "fim": leituras[-1].timestamp,
        "minimo": min(niveis),
        "maximo": max(niveis),
        "media": round(sum(niveis) / len(niveis), 1),
    }


def contar_por_faixa(leituras, faixas):
    """Conta quantas leituras caíram em cada faixa de alerta.

    Retorna:
        dict: {chave da faixa: quantidade}, na ordem normal -> crítico.
    """
    contagem = {faixa["chave"]: 0 for faixa in faixas}
    for leitura in leituras:
        faixa = classificar_nivel(leitura.nivel_cm, faixas)
        contagem[faixa["chave"]] += 1
    return contagem


def leituras_ate(leituras, momento):
    """Devolve só as leituras feitas até o momento informado (inclusive).

    Serve para "voltar no tempo" e ver o que o sistema mostraria naquela hora.
    """
    return [leitura for leitura in leituras if leitura.timestamp <= momento]


def velocidade_subida(leituras, janela_min=JANELA_PADRAO_MIN):
    """Calcula a velocidade de subida da água, em cm por hora.

    Usa as leituras dos últimos `janela_min` minutos e encontra a reta que
    melhor passa por elas (regressão linear pelo método dos mínimos
    quadrados). A inclinação dessa reta é a velocidade:
        positiva = subindo, negativa = descendo, perto de zero = estável.

    Fórmula da inclinação:
        inclinacao = soma((x - media_x) * (y - media_y)) / soma((x - media_x)^2)
    onde x = tempo em horas e y = nível em cm.

    Retorna:
        float: velocidade em cm/h, ou None se houver menos de 2 leituras na janela.
    """
    if not leituras:
        return None

    # 1) Pega só as leituras dentro da janela de tempo
    fim = leituras[-1].timestamp
    inicio = fim - timedelta(minutes=janela_min)
    janela = [leitura for leitura in leituras if leitura.timestamp >= inicio]
    if len(janela) < 2:
        return None

    # 2) x = horas desde a primeira leitura da janela; y = nível em cm
    x = [(leitura.timestamp - janela[0].timestamp).total_seconds() / 3600 for leitura in janela]
    y = [leitura.nivel_cm for leitura in janela]

    # 3) Médias de x e de y
    media_x = sum(x) / len(x)
    media_y = sum(y) / len(y)

    # 4) Inclinação da reta (mínimos quadrados)
    numerador = sum((xi - media_x) * (yi - media_y) for xi, yi in zip(x, y))
    denominador = sum((xi - media_x) ** 2 for xi in x)
    if denominador == 0:  # todas as leituras no mesmo instante: não dá para calcular
        return None

    return numerador / denominador


def tendencia(velocidade_cm_h):
    """Traduz a velocidade em uma palavra simples: subindo, descendo ou estável."""
    if velocidade_cm_h is None:
        return "sem dados suficientes"
    if velocidade_cm_h >= VELOCIDADE_MINIMA_CM_H:
        return "subindo"
    if velocidade_cm_h <= -VELOCIDADE_MINIMA_CM_H:
        return "descendo"
    return "estável"


def minutos_ate_critico(nivel_atual_cm, velocidade_cm_h, limite_critico_cm):
    """Estima quantos minutos faltam para a água chegar ao nível crítico.

    Supõe que a água vai continuar subindo na mesma velocidade:
        minutos = (limite crítico - nível atual) / velocidade * 60

    Retorna:
        float: minutos até o nível crítico;
        0 se o nível já está no crítico ou acima;
        None se a água não está subindo (não há previsão de chegar lá).
    """
    if nivel_atual_cm >= limite_critico_cm:
        return 0.0
    if velocidade_cm_h is None or velocidade_cm_h < VELOCIDADE_MINIMA_CM_H:
        return None
    falta_cm = limite_critico_cm - nivel_atual_cm
    return falta_cm / velocidade_cm_h * 60


def status_atual(leituras, faixas, janela_min=JANELA_PADRAO_MIN):
    """Junta tudo o que o morador precisa saber sobre a última leitura.

    Retorna:
        dict com: leitura (a mais recente), faixa, velocidade_cm_h,
        tendencia, limite_critico_cm e minutos_ate_critico.
    """
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


def calcular_antecedencia(leituras, faixas, faixa_aviso="alerta"):
    """Calcula o INDICADOR DE IMPACTO: minutos de antecedência do alerta.

    antecedência = (hora em que a água atinge o crítico)
                 - (hora do primeiro aviso na faixa `faixa_aviso`)

    Retorna:
        dict com: aviso (datetime), critico (datetime) e minutos (float);
        ou None se a série nunca chegou ao aviso ou ao crítico.
    """
    codigo_aviso = buscar_faixa(faixa_aviso, faixas)["codigo"]
    codigo_critico = buscar_faixa("critico", faixas)["codigo"]

    momento_aviso = None
    for leitura in leituras:
        codigo = classificar_nivel(leitura.nivel_cm, faixas)["codigo"]
        if momento_aviso is None and codigo >= codigo_aviso:
            momento_aviso = leitura.timestamp
        if codigo >= codigo_critico:
            if momento_aviso is None:  # segurança: nunca acontece se aviso < crítico
                momento_aviso = leitura.timestamp
            minutos = (leitura.timestamp - momento_aviso).total_seconds() / 60
            return {"aviso": momento_aviso, "critico": leitura.timestamp, "minutos": minutos}

    return None
