# Testes das faixas: carregamento do JSON e classificação nos limites.
import json
from pathlib import Path

import pytest

from faixas import buscar_faixa, carregar_faixas, classificar_nivel

CONFIG_REAL = Path(__file__).resolve().parents[2] / "dados" / "config_alertas.json"


@pytest.fixture
def faixas():
    return carregar_faixas(CONFIG_REAL)


def test_config_real_tem_quatro_faixas_em_ordem(faixas):
    assert [f["chave"] for f in faixas] == ["normal", "atencao", "alerta", "critico"]
    assert [f["codigo"] for f in faixas] == [0, 1, 2, 3]


# Valores exatamente no limite já pertencem à faixa nova
@pytest.mark.parametrize("nivel, faixa_esperada", [
    (0, "normal"),
    (149.9, "normal"),
    (150, "atencao"),
    (199.9, "atencao"),
    (200, "alerta"),
    (250, "critico"),
    (400, "critico"),
])
def test_classificar_nivel_nos_limites(faixas, nivel, faixa_esperada):
    assert classificar_nivel(nivel, faixas)["chave"] == faixa_esperada


def test_buscar_faixa_critico(faixas):
    assert buscar_faixa("critico", faixas)["a_partir_de_cm"] == 250


# JSON sem as quatro faixas deve ser recusado
def test_config_sem_faixa_obrigatoria(tmp_path):
    caminho = tmp_path / "config.json"
    caminho.write_text(json.dumps({"faixas": {"normal": {}}}), encoding="utf-8")
    with pytest.raises(ValueError, match="faixas ausentes"):
        carregar_faixas(caminho)


# Atenção (220) acima de Alerta (200) deve ser recusado
def test_config_com_limites_fora_de_ordem(tmp_path):
    def faixa(codigo, limite):
        return {"codigo": codigo, "a_partir_de_cm": limite, "rotulo": "x", "mensagem": "x"}

    config = {"faixas": {
        "normal": faixa(0, 0),
        "atencao": faixa(1, 220),
        "alerta": faixa(2, 200),
        "critico": faixa(3, 250),
    }}
    caminho = tmp_path / "config.json"
    caminho.write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(ValueError, match="precisa ser maior"):
        carregar_faixas(caminho)
