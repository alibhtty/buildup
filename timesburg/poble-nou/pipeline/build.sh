#!/bin/bash

FILE=$1

# ✅ Minificación segura
npx terser scripts/$FILE.js \
  -c passes=3 \
  -m toplevel=true \
  --ecma 2022 \
  -o scripts/$FILE.min.js

# ✅ Ofuscación segura para Scriptable
npx javascript-obfuscator scripts/$FILE.min.js \
  --compact true \
  --string-array true \
  --string-array-encoding base64 \
  --string-array-threshold 1 \
  --identifier-names-generator hexadecimal \
  --numbers-to-expressions true \
  --unicode-escape-sequence true \
  --rename-globals false \
  --self-defending false \
  --control-flow-flattening false \
  -o scripts/$FILE.obf.js

# ✅ Base64 final
base64 -i scripts/$FILE.obf.js -b 0 -o scripts/$FILE.b64




## INSTRUCCIONES

# scripts/build.sh
# chmod +x scripts/build.sh       PERMISOS
#./scripts/build.sh nombre        ARCHIVO  EJECUTAR


# archivo .sh que minimiza, ofusca y codifica en base64 un archivo .js
# usa terser y javascript-obfuscator
# requiere tener instalados terser y javascript-obfuscator
# npm install -g terser
# npm install -g javascript-obfuscator
# usa base64 para codificar en base64
# en macOS usar: base64 -i scripts/$FILE.obf.js -b 0 -o scripts/$FILE.b64
# donde $FILE es el nombre del archivo sin extension .js
# ejemplo: ./scripts/build.sh miarchivo
# genera los archivos:
# scripts/miarchivo.min.js      MINIMIZADO
# scripts/miarchivo.obf.js      OFUSCADO
# scripts/miarchivo.b64         CODIFICADO EN BASE64


# INSTRUCCIONES PARA DECODIFICAR Y EJECUTAR
# para decodificar el archivo .b64 usar:
# base64 -d scripts/miarchivo.b64 > scripts/miarchivo.dec.js
# en macOS usar: base64 -D -i scripts/miarchivo.b64 > scripts/miarchivo.dec.js
# para ejecutar el archivo decodificado usar:
# node scripts/miarchivo.dec.js
