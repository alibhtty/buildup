// =======================
// HorarioTimes Loader
// 4Bdev® – Ali Bhtty
// =======================

// URL DEL SCRIPT REAL
const REMOTE_SCRIPT_URL =
  "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/HorarioTimes.runtime.js";

// Cache (opcional pero recomendado)
const fm = FileManager.iCloud();
const CACHE_PATH = fm.joinPath(fm.documentsDirectory(), "HorarioTimes.cache.js");

// Tiempo de vida del cache (ej: 30 min)
const CACHE_TTL = 30 * 60 * 1000;

async function loadRemoteScript() {
  try {
    // 1️⃣ Si hay cache válido → usarlo
    if (fm.fileExists(CACHE_PATH)) {
      const stat = fm.modificationDate(CACHE_PATH);
      if (Date.now() - stat.getTime() < CACHE_TTL) {
        return fm.readString(CACHE_PATH);
      }
    }

    // 2️⃣ Descargar remoto
    const req = new Request(REMOTE_SCRIPT_URL);
    const code = await req.loadString();

    // 3️⃣ Guardar cache
    fm.writeString(CACHE_PATH, code);

    return code;
  } catch (e) {
    // 4️⃣ Fallback a cache si existe
    if (fm.fileExists(CACHE_PATH)) {
      return fm.readString(CACHE_PATH);
    }
    throw e;
  }
}

// 🚀 EJECUCIÓN
const remoteCode = await loadRemoteScript();

// 🔑 Ejecutar en contexto async real
await (new Function(`
  return (async () => {
    ${remoteCode}
  })();
`))();
