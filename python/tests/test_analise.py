"""Testes do módulo analise (velocidade, tempo até o crítico, indicador)."""

from datetime import datetime, timedelta
from pathlib import Path

import pytest

from analise import (
    calcular_antecedencia,
    contar_por_faixa,
    leituras_ate,
    minutos_ate_critico,
    resumo_estatistico,
    status_atual,
    tendencia,
    velocidade_subida,
)
from faixas import carregar_faixas
from leitura import Leitura, ler_csv

RAIZ = Path(__file__).resolve().parents[2]
INICIO = datetime(2026, 11, 4, 0, 0, 0)


@pytest.fixture
def faixas():
    return carregar_faixas(RAIZ / "dados" / "config_alertas.json")


def serie(niveis, intervalo_min=10):
    """Cria leituras artificiais a partir de uma lista de níveis."""
    return [
        Leitura(INICIO + timedelta(minutes=i * intervalo_min), nivel, "Teste")
        for i, nivel in enumerate(niveis)
    ]


# ---------- velocidade e tendência ----------

def test_velocidade_de_reta_perfeita():
    # sobe 5 cm a cada 10 min = 30 cm/h
    leituras = serie([100, 105, 110, 115, 120, 125, 130])
    assert velocidade_subida(leituras) == pytest.approx(30.0)


def test_velocidade_usa_so_a_janela():
    # 2 h paradas e depois 1 h subindo 6 cm a cada 10 min (36 cm/h).
    # Com janela de 50 min, só as leituras da subida entram na conta.
    leituras = serie([100] * 12 + [106, 112, 118, 124, 130, 136])
    assert velocidade_subida(leituras, janela_min=50) == pytest.approx(36.0)


def test_velocidade_com_uma_leitura_so():
    assert velocidade_subida(serie([100])) is None


@pytest.mark.parametrize("velocidade, esperado", [
    (10.0, "subindo"),
    (0.5, "estável"),
    (-10.0, "descendo"),
    (None, "sem dados suficientes"),
])
def test_tendencia(velocidade, esperado):
    assert tendencia(velocidade) == esperado


# ---------- minutos até o crítico ----------

def test_minutos_ate_critico_conta_simples():
    # faltam 50 cm subindo a 25 cm/h -> 2 h = 120 min
    assert minutos_ate_critico(200, 25, 250) == pytest.approx(120.0)


def test_minutos_quando_ja_esta_no_critico():
    assert minutos_ate_critico(260, 0, 250) == 0.0


def test_minutos_quando_nao_esta_subindo():
    assert minutos_ate_critico(100, 0.0, 250) is None
    assert minutos_ate_critico(100, -5.0, 250) is None


# ---------- funções de apoio ----------

def test_resumo_e_contagem(faixas):
    leituras = serie([80, 160, 210, 260])
    resumo = resumo_estatistico(leituras)
    assert resumo["quantidade"] == 4
    assert resumo["minimo"] == 80 and resumo["maximo"] == 260
    assert contar_por_faixa(leituras, faixas) == {"normal": 1, "atencao": 1, "alerta": 1, "critico": 1}


def test_leituras_ate_um_momento():
    leituras = serie([1, 2, 3, 4])
    assert len(leituras_ate(leituras, INICIO + timedelta(minutes=10))) == 2


def test_status_atual_subindo(faixas):
    leituras = serie([180, 185, 190, 195, 200, 205, 210])  # 30 cm/h
    status = status_atual(leituras, faixas)
    assert status["faixa"]["chave"] == "alerta"
    assert status["tendencia"] == "subindo"
    assert status["minutos_ate_critico"] == pytest.approx(80.0)  # 40 cm a 30 cm/h


# ---------- indicador de impacto ----------

def test_antecedencia_serie_artificial(faixas):
    # alerta (>=200) na 3ª leitura (20 min), crítico (>=250) na 6ª (50 min)
    leituras = serie([150, 180, 200, 220, 240, 250])
    resultado = calcular_antecedencia(leituras, faixas)
    assert resultado["minutos"] == 30


def test_antecedencia_quando_nunca_chega_ao_critico(faixas):
    assert calcular_antecedencia(serie([80, 90, 210]), faixas) is None


def test_antecedencia_nos_dados_simulados_do_projeto(faixas):
    # Teste de integração: usa o CSV real do projeto.
    leituras, erros = ler_csv(RAIZ / "dados" / "niveis_simulados.csv")
    assert erros == []
    assert calcular_antecedencia(leituras, faixas)["minutos"] == 110
