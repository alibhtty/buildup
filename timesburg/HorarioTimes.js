// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;

// =============================
//   HorarioTimes.js
//   by Ali Bhtty – 4Bdev®
// =============================

const PAYLOAD_URL =
  "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/payloads/HTsantpau-free.b64";

const fm = FileManager.local();
const CACHE_PATH = fm.joinPath(fm.documentsDirectory(), ".ht.cache");

async function loadPayload() {
  let encoded;

  if (fm.fileExists(CACHE_PATH)) {
    encoded = fm.readString(CACHE_PATH);
  } else {
    const req = new Request(PAYLOAD_URL);
    req.timeoutInterval = 5;
    encoded = await req.loadString();
    fm.writeString(CACHE_PATH, encoded);
  }

  if (!encoded || encoded.length < 200) {
    throw new Error("HorarioTimes: payload vacío o corrupto");
  }

  encoded = encoded.replace(/\s+/g, "");

  const data = Data.fromBase64String(encoded);
  if (!data) {
    throw new Error("HorarioTimes: payload NO es Base64 válido");
  }

  const code = data.toRawString();
  await new Function(code)();
}
// 👇 ESTO es lo que cambia 
(async () => { 
  await loadPayload(); 
})();