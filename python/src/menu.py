"""
Menu de terminal do AlertaCheia.

Mostra ao morador o resumo dos dados, o status atual da água e o tempo
estimado até o nível crítico. Este é o único módulo que usa print() e
input(): a lógica fica em leitura.py, faixas.py e analise.py.

Como executar (a partir da raiz do repositório):
    python python/src/menu.py
    python python/src/menu.py --arquivo python/exemplos/niveis_com_erros.csv
"""

import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

from analise import (
    JANELA_PADRAO_MIN,
    calcular_antecedencia,
    contar_por_faixa,
    leituras_ate,
    resumo_estatistico,
    status_atual,
)
from faixas import carregar_faixas
from leitura import ler_csv

# Arquivos padrão: os do núcleo de dados compartilhado (pasta dados/)
RAIZ = Path(__file__).resolve().parents[2]
CSV_PADRAO = RAIZ / "dados" / "niveis_simulados.csv"
CONFIG_PADRAO = RAIZ / "dados" / "config_alertas.json"

# Símbolo em texto para cada faixa: a informação nunca depende só de cor
ICONES = {"normal": "[ OK ]", "atencao": "[ ! ]", "alerta": "[ !! ]", "critico": "[ !!! ]"}


# ---------------------------------------------------------------
# Funções de formatação (deixam os números fáceis de ler)
# ---------------------------------------------------------------

def formatar_data(momento):
    """Ex.: datetime(2026, 11, 5, 1, 10) -> '05/11/2026 01:10'."""
    return momento.strftime("%d/%m/%Y %H:%M")


def formatar_minutos(minutos):
    """Transforma minutos em texto simples. Ex.: 106.4 -> '1 h 46 min'."""
    if minutos is None:
        return "sem previsão (a água não está subindo)"
    if minutos == 0:
        return "JÁ ATINGIU o nível crítico"
    total = round(minutos)
    horas, resto = divmod(total, 60)
    if horas == 0:
        return f"{resto} min"
    return f"{horas} h {resto:02d} min"


def formatar_faixa(faixa):
    """Ex.: '[ !! ] ALERTA'."""
    return f"{ICONES[faixa['chave']]} {faixa['rotulo'].upper()}"


# ---------------------------------------------------------------
# Telas do menu
# ---------------------------------------------------------------

def mostrar_resumo(leituras, faixas, erros):
    """Opção 1: números gerais da série e o indicador de impacto."""
    resumo = resumo_estatistico(leituras)
    print("\n--- RESUMO DOS DADOS ---")
    print(f"Estação: {leituras[0].estacao}")
    print(f"Período: {formatar_data(resumo['inicio'])} até {formatar_data(resumo['fim'])}")
    print(f"Leituras válidas: {resumo['quantidade']} | linhas ignoradas: {len(erros)}")
    print(f"Nível mínimo: {resumo['minimo']:.1f} cm | máximo: {resumo['maximo']:.1f} cm"
          f" | média: {resumo['media']:.1f} cm")

    print("\nLeituras em cada faixa:")
    contagem = contar_por_faixa(leituras, faixas)
    for faixa in faixas:
        print(f"  {formatar_faixa(faixa):<16} {contagem[faixa['chave']]:>4} leituras"
              f"  (a partir de {faixa['a_partir_de_cm']:.0f} cm)")

    print("\nIndicador de impacto (antecedência do alerta):")
    antecedencia = calcular_antecedencia(leituras, faixas)
    if antecedencia is None:
        print("  A água não chegou ao nível crítico neste período.")
    else:
        print(f"  Primeiro aviso de ALERTA: {formatar_data(antecedencia['aviso'])}")
        print(f"  Água no nível CRÍTICO:    {formatar_data(antecedencia['critico'])}")
        print(f"  Antecedência: {formatar_minutos(antecedencia['minutos'])}"
              f" ({antecedencia['minutos']:.0f} minutos para agir)")


def mostrar_status(leituras, faixas):
    """Opção 2: o que o morador precisa saber agora."""
    status = status_atual(leituras, faixas)
    leitura = status["leitura"]
    faixa = status["faixa"]
    velocidade = status["velocidade_cm_h"]

    print(f"\n--- STATUS EM {formatar_data(leitura.timestamp)} ---")
    print(f"Nível da água: {leitura.nivel_cm:.1f} cm")
    print(f"Faixa: {formatar_faixa(faixa)}")
    print(f"O que fazer: {faixa['mensagem']}")
    if velocidade is None:
        print("Tendência: sem dados suficientes")
    else:
        print(f"Tendência: {status['tendencia']} ({velocidade:+.1f} cm/h)")
    print(f"Tempo até o nível crítico ({status['limite_critico_cm']:.0f} cm): "
          f"{formatar_minutos(status['minutos_ate_critico'])}")


def mostrar_tempo_estimado(leituras, faixas):
    """Opção 3: a estimativa até o crítico, com a conta explicada."""
    status = status_atual(leituras, faixas)
    leitura = status["leitura"]
    limite = status["limite_critico_cm"]
    velocidade = status["velocidade_cm_h"]
    minutos = status["minutos_ate_critico"]

    print("\n--- TEMPO ESTIMADO ATÉ O NÍVEL CRÍTICO ---")
    print(f"Nível atual: {leitura.nivel_cm:.1f} cm | nível crítico: {limite:.0f} cm")

    if minutos == 0:
        print("A água JÁ ESTÁ no nível crítico. Saia agora para um local seguro.")
        return
    if minutos is None:
        texto_velocidade = "sem dados" if velocidade is None else f"{velocidade:+.1f} cm/h"
        print(f"Velocidade na última hora: {texto_velocidade}")
        print("A água não está subindo, então não há previsão de chegar ao crítico.")
        print("Continue acompanhando: a situação pode mudar.")
        return

    falta = limite - leitura.nivel_cm
    previsao = leitura.timestamp + timedelta(minutes=minutos)
    print(f"Faltam: {falta:.1f} cm")
    print(f"Velocidade de subida (últimos {JANELA_PADRAO_MIN} min): {velocidade:.1f} cm/h")
    print(f"Conta: {falta:.1f} cm / {velocidade:.1f} cm/h x 60 = {minutos:.0f} min")
    print(f"Estimativa: chega ao crítico em {formatar_minutos(minutos)}"
          f" (por volta de {previsao.strftime('%H:%M')} do dia {previsao.strftime('%d/%m')})")
    print("Atenção: a estimativa supõe que a água continue subindo no mesmo ritmo.")


def simular_momento(leituras, faixas):
    """Opção 4: 'volta no tempo' e mostra o que o sistema diria naquela hora."""
    print("\n--- SIMULAR OUTRO MOMENTO ---")
    print(f"Os dados vão de {formatar_data(leituras[0].timestamp)}"
          f" até {formatar_data(leituras[-1].timestamp)}.")
    texto = input("Digite data e hora (ex.: 05/11/2026 01:10) ou Enter para voltar: ").strip()
    if not texto:
        return

    try:
        momento = datetime.strptime(texto, "%d/%m/%Y %H:%M")
    except ValueError:
        print("Formato inválido. Use dia/mês/ano hora:minuto, por exemplo 05/11/2026 01:10.")
        return

    ate_ali = leituras_ate(leituras, momento)
    if not ate_ali:
        print("Não há leituras até esse momento. Escolha uma data dentro do período acima.")
        return

    mostrar_status(ate_ali, faixas)
    mostrar_tempo_estimado(ate_ali, faixas)


def mostrar_erros(erros):
    """Opção 5: linhas do arquivo que foram ignoradas e o motivo."""
    print("\n--- LINHAS IGNORADAS NA LEITURA ---")
    if not erros:
        print("Nenhuma: todas as linhas do arquivo são válidas.")
        return
    for erro in erros:
        print(f"  - {erro}")


# ---------------------------------------------------------------
# Programa principal
# ---------------------------------------------------------------

MENU = """
========================================
 AlertaCheia | Humaitá, Porto Alegre
========================================
 1 - Resumo dos dados
 2 - Status atual
 3 - Tempo estimado até o nível crítico
 4 - Simular outro momento
 5 - Linhas ignoradas na leitura
 0 - Sair"""


def main():
    """Carrega os arquivos e repete o menu até o usuário escolher sair."""
    parser = argparse.ArgumentParser(description="AlertaCheia: alerta de subida da água")
    parser.add_argument("--arquivo", default=CSV_PADRAO, help="CSV com as leituras")
    parser.add_argument("--config", default=CONFIG_PADRAO, help="JSON com as faixas de alerta")
    argumentos = parser.parse_args()

    # Carrega os dados; se algo der errado, explica e encerra sem travar
    try:
        leituras, erros = ler_csv(argumentos.arquivo)
        faixas = carregar_faixas(argumentos.config)
    except FileNotFoundError as erro:
        print(f"Arquivo não encontrado: {erro.filename}")
        print("Confira o caminho ou rode antes: python python/src/gerar_dados.py")
        sys.exit(1)
    except ValueError as erro:
        print(f"Problema no arquivo: {erro}")
        sys.exit(1)

    if not leituras:
        print("Nenhuma leitura válida no arquivo. Use a opção 5 para ver o motivo.")
        mostrar_erros(erros)
        sys.exit(1)

    print(f"\nArquivo: {argumentos.arquivo}")
    print("Aviso: os dados de nível são SIMULADOS (não são medições reais).")
    if erros:
        print(f"{len(erros)} linha(s) inválida(s) foram ignoradas. Veja a opção 5.")

    acoes = {
        "1": lambda: mostrar_resumo(leituras, faixas, erros),
        "2": lambda: mostrar_status(leituras, faixas),
        "3": lambda: mostrar_tempo_estimado(leituras, faixas),
        "4": lambda: simular_momento(leituras, faixas),
        "5": lambda: mostrar_erros(erros),
    }

    while True:
        print(MENU)
        try:
            opcao = input("Escolha uma opção: ").strip()
        except (EOFError, KeyboardInterrupt):  # Ctrl+C ou fim da entrada
            opcao = "0"

        if opcao == "0":
            print("Até logo. Em emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).")
            break
        if opcao in acoes:
            acoes[opcao]()
        else:
            print("Opção inválida. Digite um número de 0 a 5.")


if __name__ == "__main__":
    main()
