"""
Faixas de alerta (normal, atenção, alerta, crítico).

Os limites NÃO ficam escritos no código: eles vêm do arquivo
dados/config_alertas.json, que é o mesmo usado pelas outras partes do
projeto. Assim, para mudar um limite, basta editar o JSON.
"""

import json

# Nomes das faixas que o arquivo de configuração precisa ter
FAIXAS_OBRIGATORIAS = ["normal", "atencao", "alerta", "critico"]


def carregar_faixas(caminho):
    """Lê o config_alertas.json e devolve as faixas em ordem crescente de nível.

    Parâmetros:
        caminho (str ou Path): caminho do arquivo JSON.

    Retorna:
        list[dict]: uma faixa por item, da mais baixa para a mais alta. Ex.:
            {"chave": "alerta", "codigo": 2, "a_partir_de_cm": 200,
             "rotulo": "Alerta", "mensagem": "..."}

    Lança:
        FileNotFoundError: se o arquivo não existir.
        ValueError: se faltar alguma faixa ou se os limites não estiverem em ordem.
    """
    with open(caminho, encoding="utf-8") as arquivo:
        config = json.load(arquivo)

    faixas_do_arquivo = config.get("faixas", {})
    faltando = [nome for nome in FAIXAS_OBRIGATORIAS if nome not in faixas_do_arquivo]
    if faltando:
        raise ValueError(f"faixas ausentes no arquivo de configuração: {', '.join(faltando)}")

    # Monta a lista na ordem normal -> atenção -> alerta -> crítico
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

    # Cada faixa precisa começar acima da anterior (senão a classificação fica errada)
    for anterior, atual in zip(faixas, faixas[1:]):
        if atual["a_partir_de_cm"] <= anterior["a_partir_de_cm"]:
            raise ValueError(
                f"o limite de '{atual['chave']}' precisa ser maior que o de '{anterior['chave']}'"
            )

    return faixas


def classificar_nivel(nivel_cm, faixas):
    """Diz em qual faixa de alerta um nível de água está.

    A regra: a faixa é a ÚLTIMA cujo limite inicial ("a_partir_de_cm")
    é menor ou igual ao nível. Ex.: com limites 0/150/200/250,
    um nível de 210 cm está na faixa "alerta".

    Parâmetros:
        nivel_cm (float): nível da água em cm.
        faixas (list[dict]): faixas em ordem crescente (de carregar_faixas).

    Retorna:
        dict: a faixa correspondente.
    """
    faixa_encontrada = faixas[0]  # se o nível for menor que tudo, fica na primeira
    for faixa in faixas:
        if nivel_cm >= faixa["a_partir_de_cm"]:
            faixa_encontrada = faixa
    return faixa_encontrada


def buscar_faixa(chave, faixas):
    """Devolve a faixa com a chave informada (ex.: "critico")."""
    for faixa in faixas:
        if faixa["chave"] == chave:
            return faixa
    raise ValueError(f"faixa não encontrada: {chave}")
