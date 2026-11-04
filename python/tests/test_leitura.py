"""Testes do módulo leitura (leitura e validação do CSV)."""

from datetime import datetime

import pytest

from leitura import ler_csv, validar_linha


def linha(timestamp="2026-11-04T12:00:00", nivel_cm="182.5", estacao="Humaitá"):
    """Monta uma linha de CSV (dicionário de textos) para os testes."""
    return {"timestamp": timestamp, "nivel_cm": nivel_cm, "estacao": estacao}


def escrever_csv(pasta, conteudo):
    """Cria um arquivo CSV temporário com o conteúdo informado."""
    caminho = pasta / "teste.csv"
    caminho.write_text(conteudo, encoding="utf-8")
    return caminho


# ---------- validar_linha ----------

def test_linha_valida_vira_leitura():
    leitura = validar_linha(linha())
    assert leitura.timestamp == datetime(2026, 11, 4, 12, 0, 0)
    assert leitura.nivel_cm == 182.5
    assert leitura.estacao == "Humaitá"


def test_espacos_em_volta_sao_ignorados():
    leitura = validar_linha(linha(nivel_cm=" 90.0 ", estacao=" Humaitá "))
    assert leitura.nivel_cm == 90.0
    assert leitura.estacao == "Humaitá"


@pytest.mark.parametrize("linha_ruim, trecho_da_mensagem", [
    (linha(timestamp="04/11/2026 12:00"), "data/hora inválida"),
    (linha(timestamp=""), "data/hora inválida"),
    (linha(nivel_cm="abc"), "não é um número"),
    (linha(nivel_cm=""), "não é um número"),
    (linha(nivel_cm="-5"), "fora do possível"),
    (linha(nivel_cm="999"), "fora do possível"),
    (linha(estacao=""), "estação vazia"),
])
def test_linha_invalida_gera_erro_com_motivo(linha_ruim, trecho_da_mensagem):
    with pytest.raises(ValueError, match=trecho_da_mensagem):
        validar_linha(linha_ruim)


# ---------- ler_csv ----------

def test_ler_csv_separa_validas_e_erros(tmp_path):
    caminho = escrever_csv(tmp_path, (
        "timestamp,nivel_cm,estacao\n"
        "2026-11-04T00:00:00,80.0,Humaitá\n"
        "2026-11-04T00:10:00,abc,Humaitá\n"      # linha 3: nível inválido
        "2026-11-04T00:20:00,81.0,Humaitá\n"
    ))
    leituras, erros = ler_csv(caminho)
    assert len(leituras) == 2
    assert len(erros) == 1
    assert erros[0].startswith("linha 3:")


def test_ler_csv_ordena_e_remove_repetidas(tmp_path):
    caminho = escrever_csv(tmp_path, (
        "timestamp,nivel_cm,estacao\n"
        "2026-11-04T00:20:00,82.0,Humaitá\n"
        "2026-11-04T00:00:00,80.0,Humaitá\n"
        "2026-11-04T00:00:00,99.0,Humaitá\n"     # repetida
    ))
    leituras, erros = ler_csv(caminho)
    assert [l.nivel_cm for l in leituras] == [80.0, 82.0]
    assert len(erros) == 1
    assert "repetida" in erros[0]


def test_ler_csv_sem_coluna_obrigatoria(tmp_path):
    caminho = escrever_csv(tmp_path, "timestamp,nivel\n2026-11-04T00:00:00,80\n")
    with pytest.raises(ValueError, match="colunas obrigatórias ausentes"):
        ler_csv(caminho)


def test_ler_csv_arquivo_inexistente(tmp_path):
    with pytest.raises(FileNotFoundError):
        ler_csv(tmp_path / "nao_existe.csv")
