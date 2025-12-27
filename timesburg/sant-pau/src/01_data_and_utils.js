// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: calendar-alt;
// ===========================
//   WIDGET HORARIOTIMES.js
//   4Bdev. – Ali Bhtty
// ===========================

// ===============================
// MODO APP → ABRIR LANDING HTML
// ===============================
if (!config.runsInWidget) {
  await abrirLandingHorarioTimes()
  Script.complete()
  return
}

// ========================================================
// ============= 1. DATOS DE SEMANAS COMPLETOS ============
const DATA_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/data/semanas.json";

const USERS_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/data/users.json"; 

// Cargar users.json (NUEVO)
async function cargarUsuarios() {
  try {
    const req = new Request(USERS_URL);
    return await req.loadJSON();
  } catch (e) {
    console.error("Error cargando users.json", e);
    return {};
  }
}

//OFERTA FREE GLOBAL (desde / hasta)
function ofertaFreeActiva(config) {
  if (!config?.oferta_free) return false;

  const ahora = new Date();

  const desde = config.oferta_free.desde
    ? new Date(config.oferta_free.desde + "T00:00:00")
    : null;

  const hasta = config.oferta_free.hasta
    ? new Date(config.oferta_free.hasta + "T23:59:59")
    : null;

  if (desde && ahora < desde) return false;
  if (hasta && ahora > hasta) return false;

  return true;
}


function usuarioActivo(usersData) {
  const ahora = new Date();

  // 1️⃣ OFERTA FREE GLOBAL → PRIORIDAD ABSOLUTA
  const oferta = usersData.configuracion_global?.oferta_free;
  if (oferta?.desde && oferta?.hasta) {
    const desde = new Date(oferta.desde + "T00:00:00");
    const hasta = new Date(oferta.hasta + "T23:59:59");

    if (ahora >= desde && ahora <= hasta) {
      return true; // 🔓 TODOS ACTIVOS
    }
  }

  // 2️⃣ USUARIO
  const clave = args.widgetParameter?.toLowerCase();
  if (!clave) return false; // ❌ ahora solo bloquea si no hay oferta_free activa

  const usuario = usersData.usuarios?.[clave];
  if (!usuario) return false;

  // 3️⃣ RANGO PERSONAL DEL USUARIO
  if (usuario.activo_desde || usuario.activo_hasta) {
    const desde = usuario.activo_desde
      ? new Date(usuario.activo_desde + "T00:00:00")
      : null;

    const hasta = usuario.activo_hasta
      ? new Date(usuario.activo_hasta + "T23:59:59")
      : null;

    if (desde && ahora < desde) return false;
    if (hasta && ahora > hasta) return false;
    return true;
  }

  // 4️⃣ SOLO SI NO HAY FECHAS → activo_por_defecto
  return usuario.activo_por_defecto === true;
}



async function cargarSemanas() {
  try {
    const req = new Request(DATA_URL);
    const text = await req.loadString();

    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      throw new Error("El JSON no es un array");
    }

    return data;
  } catch (e) {
    console.error("Error cargando semanas:", e);
    return [];
  }
}


// ========================================================
// ====================== UTILIDADES ======================
// ========================================================

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

function tieneTurnoValido(trab, dia, turno) {
  const t = trab.horarios?.[dia]?.[turno];
  if (!t || t.length !== 2) return false;

  const [ini, fin] = t;
  return ini?.trim() !== "" && fin?.trim() !== "";
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function menor(h1, h2) {
  const [a, b] = h1.split(":").map(Number);
  const [c, d] = h2.split(":").map(Number);
  return a < c || (a === c && b < d);
}

function mayor(h1, h2) {
  const [a, b] = h1.split(":").map(Number);
  const [c, d] = h2.split(":").map(Number);
  return a > c || (a === c && b > d);
}

function getOpeners(list, dia, turno) {
  let early = null;
  list.forEach(t => {
    const h = t.horarios[dia]?.[turno]?.[0];
    if (h) if (!early || menor(h, early)) early = h;
  });
  return list.filter(t => t.horarios[dia]?.[turno]?.[0] === early).map(t => t.nombre);
}

function getClosers(list, dia, turno, limite) {
  let late = null;
  list.forEach(t => {
    const h = t.horarios[dia]?.[turno]?.[1];
    if (h && (menor(h, limite) || h === limite)) {
      if (!late || mayor(h, late)) late = h;
    }
  });
  return list.filter(t => t.horarios[dia]?.[turno]?.[1] === late).map(t => t.nombre);
}

// ========================================================
// ============ PARSEO PRO DE WIDGET PARAMETER ============
// ========================================================

let fechaForzada = null;
let usuarioOriginal = null; // ⚡ NUEVO: guarda el nombre del usuario aunque haya fecha forzada

(function procesarWidgetParameter() {
  if (!args.widgetParameter) return;

  const raw = args.widgetParameter.trim().toLowerCase();
  const parts = raw.split("-");

  // Formato: usuario-dd-mm-yyyy
  if (parts.length === 4) {
    const user = parts[0];
    const dd = Number(parts[1]);
    const mm = Number(parts[2]);
    const yyyy = Number(parts[3]);

    const d = new Date(yyyy, mm - 1, dd);

    if (!isNaN(d.getTime())) {
      fechaForzada = d;
      usuarioOriginal = user;  // 🔥 Guardamos el usuario original
      args.widgetParameter = user; // seguimos usando solo el usuario para la lógica
    }
  } else {
    usuarioOriginal = args.widgetParameter; // si solo hay nombre, también guardamos
  }
})();