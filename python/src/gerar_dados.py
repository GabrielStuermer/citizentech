# Gera dados/niveis_simulados.csv: uma cheia SIMULADA (não são medições reais).
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

ESTACAO = "Humaitá"
INICIO = datetime(2026, 11, 4, 0, 0, 0)
INTERVALO_MIN = 10   # uma leitura a cada 10 minutos
SEMENTE = 2024       # semente fixa: o arquivo sai sempre igual
RUIDO_CM = 1.0       # "tremido" do sensor, em cm

# Fases da cheia: (nome, duração em horas, nível inicial, nível final)
FASES = [
    ("normal",        12,  80.0,  80.0),
    ("subida lenta",  12,  80.0, 170.0),
    ("subida rápida",  4, 170.0, 280.0),
    ("estabilização",  6, 280.0, 285.0),
]

# Caminho do CSV a partir da raiz do repositório
RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO_SAIDA = RAIZ / "dados" / "niveis_simulados.csv"


# Cria a lista de leituras, fase por fase
def gerar_leituras():
    sorteio = random.Random(SEMENTE)
    leituras = []
    momento = INICIO

    for _nome, horas, nivel_inicio, nivel_fim in FASES:
        passos = int(horas * 60 / INTERVALO_MIN)

        for i in range(passos):
            # Nível em linha reta entre o início e o fim da fase, mais um pouco de ruído
            fracao = i / passos
            nivel = nivel_inicio + (nivel_fim - nivel_inicio) * fracao
            nivel += sorteio.uniform(-RUIDO_CM, RUIDO_CM)

            leituras.append({
                "timestamp": momento.isoformat(),
                "nivel_cm": round(max(nivel, 0.0), 1),
                "estacao": ESTACAO,
            })
            momento += timedelta(minutes=INTERVALO_MIN)

    return leituras


# Grava as leituras no CSV (cria a pasta se precisar)
def salvar_csv(leituras, caminho):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.DictWriter(arquivo, fieldnames=["timestamp", "nivel_cm", "estacao"])
        escritor.writeheader()
        escritor.writerows(leituras)


# Gera, salva e mostra um resumo do que foi criado
def main():
    leituras = gerar_leituras()
    salvar_csv(leituras, ARQUIVO_SAIDA)

    niveis = [leitura["nivel_cm"] for leitura in leituras]
    print(f"Arquivo gerado: {ARQUIVO_SAIDA}")
    print(f"Leituras: {len(leituras)} (uma a cada {INTERVALO_MIN} min)")
    print(f"De {leituras[0]['timestamp']} até {leituras[-1]['timestamp']}")
    print(f"Nível mínimo: {min(niveis)} cm | máximo: {max(niveis)} cm")


if __name__ == "__main__":
    main()
