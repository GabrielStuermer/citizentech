"""
Leitura e validação das leituras de nível da água (arquivo CSV).

Cada linha do CSV deve seguir o contrato de dados do projeto:
    timestamp,nivel_cm,estacao
    2026-11-04T12:00:00,182.5,Humaitá

Linhas inválidas NÃO derrubam o programa: elas são ignoradas e o motivo
fica registrado em uma lista de erros, para o usuário saber o que houve.
"""

import csv
from dataclasses import dataclass
from datetime import datetime

# Colunas obrigatórias do contrato de dados
COLUNAS_OBRIGATORIAS = ["timestamp", "nivel_cm", "estacao"]

# Faixa de valores fisicamente possível para o nosso sensor.
# O ultrassônico HC-SR04 mede no máximo cerca de 400 cm, então um nível
# fora de 0 a 400 cm só pode ser erro de leitura.
NIVEL_MINIMO_CM = 0.0
NIVEL_MAXIMO_CM = 400.0


@dataclass
class Leitura:
    """Uma medição de nível da água já validada."""
    timestamp: datetime
    nivel_cm: float
    estacao: str


def validar_linha(linha):
    """Converte uma linha do CSV (dicionário de textos) em uma Leitura.

    Parâmetros:
        linha (dict): ex.: {"timestamp": "2026-11-04T12:00:00",
                            "nivel_cm": "182.5", "estacao": "Humaitá"}

    Retorna:
        Leitura: a leitura convertida e validada.

    Lança:
        ValueError: com uma mensagem simples explicando o problema.
    """
    # 1) timestamp: precisa estar no formato ISO (AAAA-MM-DDTHH:MM:SS)
    texto_data = (linha.get("timestamp") or "").strip()
    try:
        momento = datetime.fromisoformat(texto_data)
    except ValueError:
        raise ValueError(f"data/hora inválida: '{texto_data}'")

    # 2) nivel_cm: precisa ser um número
    texto_nivel = (linha.get("nivel_cm") or "").strip()
    try:
        nivel = float(texto_nivel)
    except ValueError:
        raise ValueError(f"nível não é um número: '{texto_nivel}'")

    # 3) nivel_cm: precisa estar dentro da faixa possível do sensor
    if not NIVEL_MINIMO_CM <= nivel <= NIVEL_MAXIMO_CM:
        raise ValueError(
            f"nível fora do possível ({nivel} cm; esperado de "
            f"{NIVEL_MINIMO_CM:.0f} a {NIVEL_MAXIMO_CM:.0f} cm)"
        )

    # 4) estacao: não pode estar vazia
    estacao = (linha.get("estacao") or "").strip()
    if not estacao:
        raise ValueError("estação vazia")

    return Leitura(timestamp=momento, nivel_cm=nivel, estacao=estacao)


def ler_csv(caminho):
    """Lê o arquivo CSV e separa as leituras válidas dos erros.

    Além de validar cada linha, a função:
      - ordena as leituras por data/hora;
      - descarta leituras com data/hora repetida (fica a primeira).

    Parâmetros:
        caminho (str ou Path): caminho do arquivo CSV.

    Retorna:
        tuple[list[Leitura], list[str]]: (leituras válidas, mensagens de erro).
        Cada mensagem de erro informa o número da linha no arquivo.

    Lança:
        FileNotFoundError: se o arquivo não existir.
        ValueError: se faltar alguma coluna obrigatória no cabeçalho.
    """
    leituras = []
    erros = []

    with open(caminho, newline="", encoding="utf-8") as arquivo:
        leitor = csv.DictReader(arquivo)

        # Confere o cabeçalho antes de ler as linhas
        colunas = leitor.fieldnames or []
        faltando = [c for c in COLUNAS_OBRIGATORIAS if c not in colunas]
        if faltando:
            raise ValueError(f"colunas obrigatórias ausentes: {', '.join(faltando)}")

        # A linha 1 é o cabeçalho, então os dados começam na linha 2
        for numero_linha, linha in enumerate(leitor, start=2):
            try:
                leituras.append(validar_linha(linha))
            except ValueError as erro:
                erros.append(f"linha {numero_linha}: {erro}")

    # Ordena da leitura mais antiga para a mais recente
    leituras.sort(key=lambda leitura: leitura.timestamp)

    # Remove datas/horas repetidas (mantém a primeira que apareceu)
    sem_repetidas = []
    vistos = set()
    for leitura in leituras:
        if leitura.timestamp in vistos:
            erros.append(f"data/hora repetida, leitura ignorada: {leitura.timestamp.isoformat()}")
        else:
            vistos.add(leitura.timestamp)
            sem_repetidas.append(leitura)

    return sem_repetidas, erros
