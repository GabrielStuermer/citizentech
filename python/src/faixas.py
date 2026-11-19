# Faixas de alerta: carrega os limites do JSON e classifica um nível.
import json

# As quatro faixas que o arquivo de configuração precisa ter, em ordem
FAIXAS_OBRIGATORIAS = ["normal", "atencao", "alerta", "critico"]


# Lê dados/config_alertas.json e devolve a lista de faixas, já validada
def carregar_faixas(caminho):
    with open(caminho, encoding="utf-8") as arquivo:
        config = json.load(arquivo)

    # Confere se nenhuma faixa está faltando
    faixas_do_arquivo = config.get("faixas", {})
    faltando = [nome for nome in FAIXAS_OBRIGATORIAS if nome not in faixas_do_arquivo]
    if faltando:
        raise ValueError(f"faixas ausentes no arquivo de configuração: {', '.join(faltando)}")

    # Monta um dicionário simples para cada faixa
    faixas = []
    for nome in FAIXAS_OBRIGATORIAS:
        dados = faixas_do_arquivo[nome]
        faixas.append({
            "chave": nome,
            "codigo": int(dados["codigo"]),
            "a_partir_de_cm": float(dados["a_partir_de_cm"]),
            "rotulo": dados["rotulo"],
            "mensagem": dados["mensagem"],
        })

    # Cada faixa precisa começar acima da anterior
    for anterior, atual in zip(faixas, faixas[1:]):
        if atual["a_partir_de_cm"] <= anterior["a_partir_de_cm"]:
            raise ValueError(
                f"o limite de '{atual['chave']}' precisa ser maior que o de '{anterior['chave']}'"
            )

    return faixas


# Devolve a última faixa cujo limite é <= ao nível (o limite exato já é da faixa nova)
def classificar_nivel(nivel_cm, faixas):
    faixa_encontrada = faixas[0]
    for faixa in faixas:
        if nivel_cm >= faixa["a_partir_de_cm"]:
            faixa_encontrada = faixa
    return faixa_encontrada


# Procura uma faixa pela chave (ex.: "critico")
def buscar_faixa(chave, faixas):
    for faixa in faixas:
        if faixa["chave"] == chave:
            return faixa
    raise ValueError(f"faixa não encontrada: {chave}")
