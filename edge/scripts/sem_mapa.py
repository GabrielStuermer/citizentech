# Script do PlatformIO: tira a geração do firmware.map do linker.
# O linker do ESP32 falha ao criar esse arquivo quando o caminho tem acento
# ("Área de Trabalho"). O .map é só um relatório; o firmware não precisa dele.
from SCons.Util import flatten

Import("env")  # variável fornecida pelo PlatformIO

# Opções do linker, numa lista só (sem listas dentro de listas)
opcoes = flatten(env.get("LINKFLAGS", []))

novas_opcoes = []
pular_proxima = False
for opcao in opcoes:
    texto = str(opcao)
    if pular_proxima:  # caminho do .map, que vem logo depois de "--Map"
        pular_proxima = False
        continue
    if texto == "-Wl,--Map":
        pular_proxima = True
        continue
    if "--cref" in texto:  # tabela de referências do .map: sem o arquivo, não serve
        continue
    novas_opcoes.append(opcao)

env.Replace(LINKFLAGS=novas_opcoes)
