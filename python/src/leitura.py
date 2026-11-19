# Leitura do CSV: valida cada linha e separa as leituras boas dos erros.
import csv
from dataclasses import dataclass
from datetime import datetime

COLUNAS_OBRIGATORIAS = ["timestamp", "nivel_cm", "estacao"]

# Faixa física possível (alcance do sensor instalado a 4 m)
NIVEL_MINIMO_CM = 0.0
NIVEL_MAXIMO_CM = 400.0


# Uma leitura de nível já validada
@dataclass
class Leitura:
    timestamp: datetime
    nivel_cm: float
    estacao: str


# Valida uma linha do CSV; devolve uma Leitura ou lança ValueError com o motivo
def validar_linha(linha):
    # Data/hora no formato ISO (AAAA-MM-DDTHH:MM:SS)
    texto_data = (linha.get("timestamp") or "").strip()
    try:
        momento = datetime.fromisoformat(texto_data)
    except ValueError:
        raise ValueError(f"data/hora inválida: '{texto_data}'")

    # Nível precisa ser número
    texto_nivel = (linha.get("nivel_cm") or "").strip()
    try:
        nivel = float(texto_nivel)
    except ValueError:
        raise ValueError(f"nível não é um número: '{texto_nivel}'")

    # Nível precisa estar entre 0 e 400 cm
    if not NIVEL_MINIMO_CM <= nivel <= NIVEL_MAXIMO_CM:
        raise ValueError(
            f"nível fora do possível ({nivel} cm; esperado de "
            f"{NIVEL_MINIMO_CM:.0f} a {NIVEL_MAXIMO_CM:.0f} cm)"
        )

    # Estação não pode ficar vazia
    estacao = (linha.get("estacao") or "").strip()
    if not estacao:
        raise ValueError("estação vazia")

    return Leitura(timestamp=momento, nivel_cm=nivel, estacao=estacao)


# Lê o CSV inteiro; devolve (leituras válidas e ordenadas, lista de erros)
def ler_csv(caminho):
    leituras = []
    erros = []

    with open(caminho, newline="", encoding="utf-8") as arquivo:
        leitor = csv.DictReader(arquivo)

        # Sem as colunas obrigatórias não dá para continuar
        colunas = leitor.fieldnames or []
        faltando = [c for c in COLUNAS_OBRIGATORIAS if c not in colunas]
        if faltando:
            raise ValueError(f"colunas obrigatórias ausentes: {', '.join(faltando)}")

        # Linha inválida não para o programa: vai para a lista de erros
        for numero_linha, linha in enumerate(leitor, start=2):  # linha 1 é o cabeçalho
            try:
                leituras.append(validar_linha(linha))
            except ValueError as erro:
                erros.append(f"linha {numero_linha}: {erro}")

    # Ordena por data/hora
    leituras.sort(key=lambda leitura: leitura.timestamp)

    # Data/hora repetida: fica só a primeira
    sem_repetidas = []
    vistos = set()
    for leitura in leituras:
        if leitura.timestamp in vistos:
            erros.append(f"data/hora repetida, leitura ignorada: {leitura.timestamp.isoformat()}")
        else:
            vistos.add(leitura.timestamp)
            sem_repetidas.append(leitura)

    return sem_repetidas, erros
