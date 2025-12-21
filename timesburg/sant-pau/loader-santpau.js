// =============================
//   HorarioTimes Loader (OTA)
//   Local: Sant Pau
//   by Ali Bhtty – 4Bdev®
// =============================

// Archivo remoto que contiene la URL REAL del payload
const REMOTE_JSON =
  "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/control/url.json";

const fm = FileManager.local();

async function loadPayload() {
  // 1. Descargar url.json
  let config;
  try {
    const req = new Request(REMOTE_JSON);
    req.timeoutInterval = 5;
    config = await req.loadJSON();
  } catch (e) {
    throw new Error("No se pudo obtener url.json");
  }

  // 2. Extraer la URL real del payload
  const PAYLOAD_URL = config.url;
  if (!PAYLOAD_URL) {
    throw new Error("url.json no contiene la clave 'url'");
  }

  // 3. Crear clave de caché dependiente de la URL
  const cacheKey =
    PAYLOAD_URL.length +
    "_" +
    PAYLOAD_URL.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const CACHE_PATH = fm.joinPath(
    fm.documentsDirectory(),
    `.ht_cache_${cacheKey}`
  );

  let encoded;

  // 4. Usar caché si existe
  if (fm.fileExists(CACHE_PATH)) {
    encoded = fm.readString(CACHE_PATH);
  } else {
    // 5. Descargar payload Base64
    const req = new Request(PAYLOAD_URL);
    req.timeoutInterval = 5;
    encoded = await req.loadString();
    fm.writeString(CACHE_PATH, encoded);
  }

  // 6. Validación
  if (!encoded || encoded.length < 50) {
    throw new Error("HorarioTimes: payload vacío o corrupto");
  }

  // 7. Decodificar Base64
  encoded = encoded.replace(/\s+/g, "");
  const data = Data.fromBase64String(encoded);
  if (!data) {
    throw new Error("HorarioTimes: Base64 inválido");
  }

  // 8. Ejecutar código remoto
  await new Function(data.toRawString())();
}

// Ejecutar loader
(async () => {
  await loadPayload();
})();
