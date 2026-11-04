"""
Gera a série temporal SIMULADA de níveis de água do AlertaCheia.

ATENÇÃO: estes dados NÃO são medições reais. Eles são criados por este
script apenas para testar o sistema. Nenhum dado pessoal é usado.

A série tem quatro fases, uma depois da outra, com uma leitura a cada
10 minutos:
  1. normal        -> nível estável, com pequenas oscilações
  2. subida lenta  -> a água sobe devagar (chuva contínua)
  3. subida rápida -> a água sobe rápido (cheia)
  4. estabilização -> a água para de subir em um nível alto

Como executar (a partir da raiz do repositório):
    python python/src/gerar_dados.py

Saída: dados/niveis_simulados.csv, com as colunas do contrato de dados:
    timestamp, nivel_cm, estacao
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------
# Parâmetros da simulação (todos inventados, só para teste)
# ---------------------------------------------------------------
ESTACAO = "Humaitá"
INICIO = datetime(2026, 11, 4, 0, 0, 0)  # data e hora da primeira leitura
INTERVALO_MIN = 10                       # minutos entre uma leitura e outra
SEMENTE = 2024                           # semente fixa: o arquivo sai sempre igual
RUIDO_CM = 1.0                           # oscilação máxima de cada leitura (+/- cm)

# Cada fase: (nome, duração em horas, nível no início em cm, nível no fim em cm)
FASES = [
    ("normal",        12,  80.0,  80.0),
    ("subida lenta",  12,  80.0, 170.0),
    ("subida rápida",  4, 170.0, 280.0),
    ("estabilização",  6, 280.0, 285.0),
]

# Caminho do arquivo de saída: <raiz do repositório>/dados/niveis_simulados.csv
# parents[2] sobe duas pastas a partir de python/src/ até a raiz.
RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO_SAIDA = RAIZ / "dados" / "niveis_simulados.csv"


def gerar_leituras():
    """Cria a lista de leituras seguindo as fases definidas em FASES.

    Dentro de cada fase, o nível vai do valor inicial ao final em linha
    reta (interpolação linear), e somamos um pequeno ruído aleatório
    para parecer uma medição de sensor de verdade.

    Retorna:
        list[dict]: cada item tem as chaves "timestamp", "nivel_cm" e "estacao".
    """
    sorteio = random.Random(SEMENTE)  # gerador de números aleatórios com semente fixa
    leituras = []
    momento = INICIO

    for _nome, horas, nivel_inicio, nivel_fim in FASES:
        passos = int(horas * 60 / INTERVALO_MIN)  # quantas leituras cabem na fase

        for i in range(passos):
            fracao = i / passos  # 0.0 no início da fase, quase 1.0 no fim
            nivel = nivel_inicio + (nivel_fim - nivel_inicio) * fracao
            nivel += sorteio.uniform(-RUIDO_CM, RUIDO_CM)

            leituras.append({
                "timestamp": momento.isoformat(),      # ex.: 2026-11-04T12:00:00
                "nivel_cm": round(max(nivel, 0.0), 1),  # nunca negativo, 1 casa decimal
                "estacao": ESTACAO,
            })
            momento += timedelta(minutes=INTERVALO_MIN)

    return leituras


def salvar_csv(leituras, caminho):
    """Grava as leituras em um arquivo CSV (UTF-8, separado por vírgula)."""
    caminho.parent.mkdir(parents=True, exist_ok=True)  # cria a pasta se não existir
    with open(caminho, "w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.DictWriter(arquivo, fieldnames=["timestamp", "nivel_cm", "estacao"])
        escritor.writeheader()
        escritor.writerows(leituras)


def main():
    """Gera as leituras, salva o CSV e mostra um pequeno resumo na tela."""
    leituras = gerar_leituras()
    salvar_csv(leituras, ARQUIVO_SAIDA)

    niveis = [leitura["nivel_cm"] for leitura in leituras]
    print(f"Arquivo gerado: {ARQUIVO_SAIDA}")
    print(f"Leituras: {len(leituras)} (uma a cada {INTERVALO_MIN} min)")
    print(f"De {leituras[0]['timestamp']} até {leituras[-1]['timestamp']}")
    print(f"Nível mínimo: {min(niveis)} cm | máximo: {max(niveis)} cm")


# Só executa main() quando o arquivo é rodado diretamente
# (e não quando é importado por outro módulo, como nos testes).
if __name__ == "__main__":
    main()
