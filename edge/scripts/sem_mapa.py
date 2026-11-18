# Script do PlatformIO, executado depois da configuração da plataforma ("post:").
#
# Remove a criação do arquivo firmware.map pelo linker.
# Motivo: o linker do ESP32 não consegue criar esse arquivo quando o caminho
# da pasta tem acento (ex.: "Área de Trabalho") e a compilação falha.
# O .map é só um relatório do uso de memória: o firmware não precisa dele.
#
# Também remove o "--cref" (tabela de referências do .map): sem o arquivo,
# o linker imprimiria essa tabela enorme na tela.
from SCons.Util import flatten  # noqa: E402

Import("env")  # noqa: F821 (variável fornecida pelo PlatformIO)

# A lista de opções pode ter listas dentro dela: "flatten" deixa tudo num nível só.
opcoes = flatten(env.get("LINKFLAGS", []))

novas_opcoes = []
pular_proxima = False
for opcao in opcoes:
    texto = str(opcao)
    if pular_proxima:           # é o caminho do .map, que vem logo depois da opção
        pular_proxima = False
        continue
    if texto == "-Wl,--Map":
        pular_proxima = True
        continue
    if "--cref" in texto:
        continue
    novas_opcoes.append(opcao)

env.Replace(LINKFLAGS=novas_opcoes)
