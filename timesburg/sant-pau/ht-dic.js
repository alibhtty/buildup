// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: calendar-alt;
// ===========================
//   WIDGET HORARIOTIMES.js
//   4Bdev. – Ali Bhtty
// ===========================



// ========================================================
// ============= 1. DATOS DE SEMANAS COMPLETOS ============
const DATA_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/data/semanas.json";

const USERS_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/sant-pau/data/users.json"; 


// ========================================================
// =============== CACHE LOCAL .ht.data ====================
// ========================================================
const fm = FileManager.local();
const CACHE_DATA = fm.joinPath(fm.documentsDirectory(), ".ht.data");
const CACHE_MINUTOS = 10;   // tiempo de validez del caché

/**
 * Carga las semanas desde caché o desde la red.
 * - Caché oculto en .ht.data
 * - Autoexpira a los X minutos
 * - Silencioso y seguro */
async function cargarDatos() {
  try {
    let usarCache = false;

    if (fm.fileExists(CACHE_DATA)) {
      const mod = fm.modificationDate(CACHE_DATA);
      const minutos = (Date.now() - mod.getTime()) / 1000 / 60;

      if (minutos < CACHE_MINUTOS) {
        usarCache = true;
      }
    }

    if (usarCache) {
      const contenido = fm.readString(CACHE_DATA);
      return JSON.parse(contenido);
    }

    // --- Carga desde la red ---
    const req = new Request(DATA_URL);
    req.timeoutInterval = 5;

    const json = await req.loadJSON();

    // Guardar caché solo si es válido
    if (json && Array.isArray(json)) {
      fm.writeString(CACHE_DATA, JSON.stringify(json));
    }

    return json;

  } catch (e) {
    console.error("Error en cargarDatos():", e);

    // Si falla la red, intentar usar caché viejo
    if (fm.fileExists(CACHE_DATA)) {
      try {
        return JSON.parse(fm.readString(CACHE_DATA));
      } catch (_) {}
    }

    return []; // fallback seguro
  }
}
// ========================================================
// =============== CARGA DE SEMANAS ========================
// ========================================================
const semanas = await cargarDatos();





// Cargar users.json (NUEVO)
async function cargarUsuarios() {
  try {
    const req = new Request(USERS_URL);
    req.timeoutInterval = 5;
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
  if (!clave) return false; // ahora solo bloquea si no hay oferta_free activa

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



/* async function cargarSemanas() {
  try {
    const req = new Request(DATA_URL);
    req.timeoutInterval = 5;
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
} */


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
/* let fechaForzada = null;
let usuarioOriginal = null;

(function procesarWidgetParameter() {
  const param = args.widgetParameter;
  if (!param) return;

  const raw = param.trim().toLowerCase();
  const parts = raw.split("-");

  const user = parts[0];
  usuarioOriginal = user;

  // Atajos: ayer / hoy / mañana / pasado
  if (parts.length === 2) {
    const hoy = new Date();
    const keyword = parts[1];

    const offsets = {
      "ayer": -1,
      "hoy": 0,
      "mañana": 1,
      "manana": 1,
      "pasado": 2
    };

    if (keyword in offsets) {
      fechaForzada = new Date(hoy);
      fechaForzada.setDate(hoy.getDate() + offsets[keyword]);
      args.widgetParameter = user;
      return;
    }
  }

  // Formato usuario-dd-mm-yyyy
  if (parts.length === 4) {
    const [_, dd, mm, yyyy] = parts.map(Number);
    const d = new Date(yyyy, mm - 1, dd);

    if (!isNaN(d.getTime())) {
      fechaForzada = d;
      args.widgetParameter = user;
    }
  }
})(); */

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
      args.widgetParameter = user;
    }
  } else {
    usuarioOriginal = args.widgetParameter; // si solo hay nombre, también guardamos
  }
})();



// ========================================================
// =================== AVISOS PANTALLA ====================
// ========================================================

function avisoPantallaCompleta(widget, iconoASCII, mensaje, fondoHex = "#1C1C1E") {
  widget.setPadding(0, 0, 0, 0)
  widget.backgroundColor = new Color(fondoHex)

  const stack = widget.addStack()
  stack.layoutVertically()
  stack.centerAlignContent()

  stack.addSpacer()

  const icono = stack.addText(iconoASCII)
  icono.font = Font.boldSystemFont(22)
  icono.textColor = new Color("#FFFFFF")
  icono.centerAlignText()

  stack.addSpacer(6)

  const msg = stack.addText(mensaje)
  msg.font = Font.mediumSystemFont(12)
  msg.textColor = new Color("#B0B0B0")
  msg.centerAlignText()

  stack.addSpacer()

  return widget
}

function avisoSinConexion(widget) {
  return avisoPantallaCompleta(
    widget,
    "       (ಠ_ಠ)",
    "Sin conexión a internet\nRevisa tu red",
    "#2A0A0A"
  )
}

function avisoNoHayHorarios(widget, week) {
  return avisoPantallaCompleta(
    widget,
    "       ¯\\_(ツ)_/¯",
    `Horarios no disponibles\nSemana ${week}\n\nVerifica otra fuente de horarios`,
    "#1C1C1E"
  )
}



function mostrarAviso() {
  // desactivado temporalmente
}

/* async function hayConexionInternet() {
  try {
    const r = new Request("https://www.apple.com")
    r.timeoutInterval = 3
    await r.load()
    return true
  } catch (e) {
    return false
  }
} */


// ========================================================
// ======================= WIDGET =========================
// ========================================================
async function crearWidget(usersData) {

  // Crear el widget al inicio
  const w = new ListWidget();

  // ================= CONEXIÓN =================
  //const online = await hayConexionInternet()
  //if (!online) {
  //  return avisoSinConexion(w)
  //}

  // Bloqueo por suscripción
  const activo = usuarioActivo(usersData);

  // Detectar modo claro/oscuro
  const isLightMode = !Device.isUsingDarkAppearance(); // true si light
  
  // 🔹 Colores dinámicos
  const bgColor = isLightMode ? new Color("#005d38") : new Color("#005d38"); // 00cd7b
  const headerColor = isLightMode ? new Color("#005d38") : new Color("#00d07d");
  const aperturaColor = isLightMode ? new Color("#00a651") : new Color("#00aa44");
  const cierreColor = isLightMode ? new Color("#f42828") : new Color("#ff4d4d");  // rojo f42828 d12c2c    naranja ff6600 ff8a3d 
  const textoColor = isLightMode ? new Color("#080c16") : new Color("#ddede5");

  if (!activo) {
    w.backgroundColor = bgColor;

    // Frases modernas y motivadoras
    const frases = [
      "🔓 Desbloquea tu semana\nUn widget de tu horario",
      "✨ Premium vibes only\nSuscríbete ya",
      "🚀 Tu horario sin capturas\nSuscríbete ahora",
      "Deja las fotos, vive el widget\n🔓 Acceso Premium",
    ];

    // Calcular índice según media hora + aleatorio inicial
    const ahora = new Date();
    const bloque = Math.floor(ahora.getMinutes() / 10); // 0 o 1
    const baseIndex = Math.floor(ahora.getHours() * 2 + bloque); // cada media hora
    const fraseIndex = baseIndex % frases.length;

    const t = w.addText(frases[fraseIndex]);
    t.textColor = Color.white();
    t.centerAlignText();

    w.addSpacer(28);

    // Contenedor centrador
    const contenedor = w.addStack();
    contenedor.layoutHorizontally();
    contenedor.centerAlignContent();
    contenedor.addSpacer();

    w.addSpacer(3);
        // Texto debajo del botón
    const t5 = w.addText("Activación de 1h a 5h tras el pago.");
    t5.textColor = new Color("#ffffff", 0.8);
    t5.centerAlignText();
    t5.font = Font.systemFont(8.5);
    w.addSpacer(8);

    if (args.widgetParameter) {
      const formattedUser = (usuarioOriginal ?? args.widgetParameter)
  .charAt(0)
  .toUpperCase() + (usuarioOriginal ?? args.widgetParameter).slice(1).toLowerCase();
      const tUser = w.addText(`Usuario: ${formattedUser}`);
      tUser.textColor = new Color("#ffffff", 0.9);
      tUser.font = Font.boldSystemFont(11);
      tUser.centerAlignText();
      w.addSpacer(8);
    }



    // Aviso si NO hay parameter
    if (!args.widgetParameter) {
      const aviso = w.addText(
        "Mantén presionado el widget, presiona editar\ny pon tu nombre en 'Parámetro' antes de pagar"
      );
      aviso.textColor = new Color("#ffffff", 0.95);
      aviso.font = Font.boldSystemFont(9);
      aviso.centerAlignText();
      w.addSpacer(10);
    }
    
    
    // ========= WIDGET ========
    const boton = contenedor.addStack();
    boton.layoutHorizontally();
    boton.centerAlignContent();
    boton.backgroundColor = new Color("#000000");
    boton.cornerRadius = 20;
    boton.setPadding(12, 22, 12, 22);
    
    const icono = boton.addText("");
    icono.textColor = Color.white();
    icono.font = Font.boldSystemFont(18);
    
    boton.addSpacer(8);

    const textoBoton = boton.addText("Pagar 2€/mes");
    textoBoton.textColor = Color.white();
    textoBoton.font = Font.boldSystemFont(18);
    
    // Si NO hay parameter → botón desactivado visual y funcional
    if (!args.widgetParameter) {
      boton.backgroundColor = new Color("#000000", 0.35);
      icono.textColor = new Color("#ffffff", 0.45);
      textoBoton.textColor = new Color("#ffffff", 0.45);
    } else {
      // ---- datos para Stripe ----
      const nombreUsuario = args.widgetParameter.toLowerCase();
    
      const inicio = new Date();
      const fin = new Date();
      fin.setMonth(fin.getMonth() + 1);
    
      const f = d =>
        `${String(d.getDate()).padStart(2, "0")}/` +
        `${String(d.getMonth() + 1).padStart(2, "0")}/` +
        d.getFullYear();
    
      const referencia = `${nombreUsuario}-${f(inicio)}-${f(fin)}`;
    
      // ---- URL Stripe ----
      boton.url =
        "https://buy.stripe.com/00g7wm7dj2Jde52dQQ" +
        `?client_reference_id=${encodeURIComponent(referencia)}`;
    }
      
    // Botón Whattsapp
    /*const boton = contenedor.addStack();
    boton.layoutHorizontally();
    boton.centerAlignContent();
    boton.backgroundColor = new Color("#FFFFFF", 0.2);
    boton.cornerRadius = 12;
    boton.setPadding(10, 16, 10, 16);
  
    const textoBoton = boton.addText("💬 Suscribirme"); // +34 602 316998
    textoBoton.textColor = Color.white();
    textoBoton.font = Font.boldSystemFont(16);
  
    const mensaje = encodeURIComponent("Hola, quiero una licencia de HorarioTimes");
    boton.url = `https://wa.me/34602316998?text=${mensaje}`; */
  
    contenedor.addSpacer();
  
    w.addSpacer(24);

    const t2 = w.addText("La suscripción sirve para mantener\nla actualización continua de datos\n y el desarrollo de este widget."); //\n\n\nUnofficial – Timesburg®
    t2.textColor = new Color("#ffffff", 0.6);
    t2.centerAlignText();
    t2.font = Font.systemFont(8.5);

    w.addSpacer(10);

    const t4 = w.addText("Este widget no está vinculado a Timesburg® ni\nreemplaza las vías oficiales para recibir los horarios.\nEs solo un skin diseñado y programado por 4Bdev\nUnofficial – Timesburg®");
    t4.textColor = new Color("#ffffff", 0.65);
    t4.centerAlignText();
    t4.font = Font.systemFont(8);

    w.addSpacer(15);


    // contenedor horizontal centrado
    const filaWrapper = w.addStack()
    filaWrapper.layoutHorizontally()
    filaWrapper.addSpacer()
    
    const fila = filaWrapper.addStack()
    fila.layoutHorizontally()
    fila.centerAlignContent()
    
    // texto izquierdo (bold) con enlace
    const tIzq = fila.addText("4Bdev®")
    tIzq.textColor = new Color("#ffffff", 0.8)
    tIzq.font = Font.boldSystemFont(9)
    tIzq.url = "https://ali-bhtty.web.app"
    
    // espacio
    fila.addSpacer(2)
    
    // texto central (sin bold)
    const tDer = fila.addText("– Ali Bhtty")
    tDer.textColor = new Color("#ffffff", 0.8)
    tDer.font = Font.systemFont(9)
    
    // espacio
    fila.addSpacer(2)
    
    // texto derecho (bold)
    const tFin = fila.addText("2025")
    tFin.textColor = new Color("#ffffff", 0.8)
    tFin.font = Font.boldSystemFont(9)
    
    filaWrapper.addSpacer()

    // 👉 Al tocar el widget se abre el HTML / landing
    widget.url = "scriptable:///run?scriptName=WIDGET%20HORARIOTIMES"
  
    mostrarAviso(w, usersData);
    return w; // ✅ Devuelve el widget
  }

  // Usar fecha forzada si existe
  const fechaWidget = fechaForzada ?? new Date();
  const dia = diasSemana[fechaWidget.getDay()];
  const week = getWeekNumber(fechaWidget);

  // ⬇️ 1. Cargar semanas REMOTAS
  //const semanas = await cargarSemanas();

  // ⬇️ 2. Buscar la semana actual
  const semana = semanas.find(s => s.id === week);

  // ---------- COLOR DE FONDO SEGÚN FECHA -----------
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0); // ignorar hora
  
  let colorFondo = bgColor; // por defecto: hoy
  
  if (fechaForzada) {
    const fForzada = new Date(fechaForzada);
    fForzada.setHours(0, 0, 0, 0);
  
    if (fForzada < fechaHoy) {
      colorFondo = new Color("#453327ff"); // pasado
    } else if (fForzada > fechaHoy) {
      colorFondo = new Color("#2f3325ff"); // futuro
    } 
    // else queda bgColor
  }
  
  // Asignar el color al widget
  const widget = new ListWidget();
  widget.backgroundColor = bgColor;
  //widget.backgroundColor = colorFondo;

  // ⬇️ 4. Control si no hay datos
  if (!semanas.length) {
    widget.addText("No se pudieron cargar los horarios");
    return widget;
  }

  if (!semana) {
    widget.setPadding(0, 0, 0, 0)
    widget.backgroundColor = bgColor;
    //widget.backgroundColor = new Color("#1C1C1E") // estilo Apple oscuro
  
    const avisoStack = widget.addStack()
    avisoStack.layoutVertically()
    avisoStack.centerAlignContent()
    avisoStack.addSpacer() // empuja hacia el centro
  
    const icono = avisoStack.addText("   ¯\\_(ツ)_/¯")
    icono.font = Font.boldSystemFont(22)
    icono.textColor = new Color("#FFFFFF")
    icono.centerAlignText()
  
    avisoStack.addSpacer(10)
  
    const msg = avisoStack.addText("Aún no hay horarios disponibles\nSemana " + week )
    msg.font = Font.mediumSystemFont(12)
    msg.textColor = new Color("#cdcdcd")
    msg.centerAlignText()
  
    avisoStack.addSpacer() // empuja hacia el centro
  
    return widget
  }


  // ================= HEADER =================
  const header = widget.addStack();
  header.layoutHorizontally();
  
  // Determinar la etiqueta correcta según fecha
  let etiquetaDia = "Hoy"; // default
  const fechaActual = new Date();
  fechaActual.setHours(0,0,0,0); // ignorar hora para comparar solo día
  
  if (fechaForzada) {
    const fForzada = new Date(fechaForzada);
    fForzada.setHours(0,0,0,0);
  
    if (fForzada < fechaActual) {
      etiquetaDia = "Aquel"; // fecha pasada
    } else if (fForzada > fechaActual) {
      etiquetaDia = "Próximo"; // fecha futura
    } else {
      etiquetaDia = "Hoy"; // misma fecha
    }
  }
  
  // Texto principal con etiqueta dinámica
  const h1_left = header.addText(`${etiquetaDia} ${diasSemana[(fechaForzada ?? fechaActual).getDay()].toUpperCase()} ${(fechaForzada ?? fechaActual).getDate()} `);
  h1_left.font = Font.boldSystemFont(12);
  h1_left.textColor = headerColor;
  
  // Icono de reloj solo si la fecha es forzada y no es hoy
  /* if (fechaForzada && fechaForzada.getTime() !== fechaActual.getTime()) {
    const tag = header.addText("⏳");
    tag.font = Font.systemFont(10);
    tag.textColor = new Color(headerColor.hex, 0.6);
  } */


  h1_left.font = Font.boldSystemFont(12);
  h1_left.textColor = headerColor; 
  //h1_left.textColor = new Color("#EFDECD"); // color base
  
  // Texto "Sem 50" con opacidad 0.5
  const h1_right = header.addText(`— Sem ${semana.id}`);
  h1_right.font = Font.italicSystemFont(10);
  h1_right.textColor = new Color(headerColor.hex, 0.65); 
  // h1_right.textColor = new Color("#EFDECD", 0.5);
  
  header.addSpacer();

  // Texto derecho: TIMESBURG y Sant Pau
  const rightStack = header.addStack();
  rightStack.layoutHorizontally();
  rightStack.centerAlignContent();
  
  /* const h2a = rightStack.addText("Timesburg ");
  h2a.font = Font.boldSystemFont(12);
  h2a.textColor = headerColor; */
  //h2a.textColor = new Color("#EFDECD");

  // tu cadena base64 (ejemplo)
  const base64String = "data:image/webp;base64,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"; // tu base64 aquí
  
  // convertir base64 a objeto Image
  function imageFromBase64(base64) {
    const data = Data.fromBase64String(base64.replace(/^data:image\/\w+;base64,/, ""))
    return Image.fromData(data)
  }
  
  // crear la imagen
  const img = imageFromBase64(base64String)
  
  // añadirla al stack en lugar de texto
  const h2a = rightStack.addImage(img)
  h2a.imageSize = new Size(63, 13) // ajusta tamaño a lo que necesites

  
  rightStack.addSpacer(3.5); // espacio entre las dos partes
  
  const h2b = rightStack.addText("Sant Pau");
  h2b.font = Font.italicSystemFont(12);
  h2b.textColor = headerColor;
  // h2b.textColor = new Color("#EFDECD");

  widget.addSpacer(2);
  
  // --- Línea horizontal debajo del header ---
  const linea = widget.addStack();
  linea.layoutHorizontally();
  linea.size = new Size(0, 0.8);
  linea.backgroundColor = new Color(headerColor.hex, 0.3);
  //linea.backgroundColor = new Color("#EFDECD", 0.3);
  linea.addSpacer(); // ocupa todo el ancho del widget
  
  widget.addSpacer(6);

  const mediodia = semana.trabajadores.filter(t => tieneTurnoValido(t, dia, "mediodia"));
  const noche = semana.trabajadores.filter(t => tieneTurnoValido(t, dia, "noche"));

  // ================= NUM ROWS GLOBAL =================
  const NUM_COLS = 3;
  
  const rowsMediodia = Math.ceil(mediodia.length / NUM_COLS);
  const rowsNoche = Math.ceil(noche.length / NUM_COLS);
  
  // 🔥 este es el valor único que usarán MD y N
  const numRowsGlobal = Math.max(rowsMediodia, rowsNoche);


  // ================= SECCIONES MD Y N =================
  addSection(widget, "Mediodía", mediodia, dia, "mediodia",
    getOpeners(mediodia, dia, "mediodia"),
    getClosers(mediodia, dia, "mediodia", "17:00"),
    aperturaColor, cierreColor, textoColor,
    numRowsGlobal
  );
  
  addSection(widget, "Noche", noche, dia, "noche",
    getOpeners(noche, dia, "noche"),
    getClosers(noche, dia, "noche", "03:00"),
    aperturaColor, cierreColor, textoColor,
    numRowsGlobal
  );

  /* addSection(widget, "Mediodía", mediodia, dia, "mediodia",
    getOpeners(mediodia, dia, "mediodia"),
    getClosers(mediodia, dia, "mediodia", "17:00"),
    aperturaColor, cierreColor, textoColor
);

addSection(widget, "Noche", noche, dia, "noche",
    getOpeners(noche, dia, "noche"),
    getClosers(noche, dia, "noche", "03:00"),
    aperturaColor, cierreColor, textoColor
); */

  widget.addSpacer(6);

  // ================= LEYENDA =================
  const ley = widget.addStack();
  ley.layoutHorizontally();
  ley.centerAlignContent();
  ley.setPadding(0, 0, 0, 0);

  // 🎨 Fondo y estilo del cuadro
  //ley.backgroundColor = new Color(headerColor.hex, 0.15);
  ley.backgroundColor = new Color("#000000", 0.15); // EFDECD
  ley.cornerRadius = 8;
  ley.setPadding(2, 2, 2, 2); 
  
  // Parte izquierda: Apertura y Cierre
  const left = ley.addStack();
  left.layoutHorizontally();
  left.centerAlignContent();
  
  const a = left.addText(" ● Apertura ");
  a.font = Font.boldSystemFont(9);
  a.textColor = aperturaColor;
  // a.textColor = new Color("#00aa44");
  
  left.addSpacer(6);
  
  const c = left.addText("● Cierre");
  c.font = Font.boldSystemFont(9);
  c.textColor = cierreColor;
  // c.textColor = new Color("#f42828");
  
  // Spacer central que empuja el stack derecho al extremo
  ley.addSpacer();
  
  // Parte derecha: aviso + botón
  const right = ley.addStack();
  right.layoutHorizontally();
  right.centerAlignContent();
  
  // ======== AVISO MODAL PEGADO A LA DERECHA DE CIERRE ========
  function agregarAvisoDerecha(rightStack, usersData) {
    const clave = args.widgetParameter?.toLowerCase();
    const usuario = usersData.usuarios?.[clave];
    let aviso = usuario?.aviso_modal?.texto ? usuario.aviso_modal : usersData.configuracion_global?.aviso_modal_global;
    if (!aviso?.texto) return;
  
    const avisoStack = rightStack.addStack();
    avisoStack.layoutHorizontally();
    avisoStack.backgroundColor = new Color(aviso.fondo || "#EFDECD", aviso.opacidad ?? 0.1);
    avisoStack.cornerRadius = 6;
    avisoStack.setPadding(2,4,2,4);
  
    const t = avisoStack.addText(aviso.texto);
    t.font = Font.systemFont(9);
    t.textColor = new Color("#EFDECD", 0.6);
    //t.textColor = Color.white();
    t.centerAlignText();
  
    rightStack.addSpacer(3); // espacio entre aviso y botón
  }
  
  // Llamar a la función
  await agregarAvisoDerecha(right, usersData);
  
  // ======== BOTÓN 4Bdev® ========
  const boton = right.addStack();
  boton.layoutHorizontally();
  boton.centerAlignContent();
  boton.backgroundColor = new Color("#EFDECD", 0.1); // semitransparente
  boton.cornerRadius = 6;
  boton.setPadding(2,6,2,6);
  
  const link = boton.addText("4Bdev®");
  link.textColor = new Color("#EFDECD", 0.6);
  link.font = Font.italicSystemFont(9);
  boton.url = "https://ali-bhtty.web.app";
  
  widget.addSpacer(4);


  // ================= TABLA TRABAJADOR =================
  if (args.widgetParameter) {
    // Línea horizontal
    const linea = widget.addStack();
    linea.layoutHorizontally();
    linea.backgroundColor = new Color(headerColor.hex, 0.45);
    //linea.backgroundColor = new Color("#EFDECD", 0.45);
    linea.size = new Size(0, 0.5); 
    linea.addSpacer();
    widget.addSpacer(2);
  
    // Normalizar parámetro
    const param = args.widgetParameter.trim().toLowerCase();
  
    // Buscar trabajador ignorando mayúsculas y caracteres extra
    const trabajador = semana.trabajadores.find(t => {
      const primerNombre = t.nombre.replace(/[^\w\s]/gi, "").split(" ")[0].toLowerCase();
      return primerNombre === param;
    });
  
    if (trabajador) {
      renderWorkerTable(widget, trabajador);
    }
  }

  return widget;
}


// ===============================
// MODO APP → ABRIR LANDING HTML
// ===============================
if (!config.runsInWidget) {
  await abrirLandingHorarioTimes()
  Script.complete()
  return
}
/*                                         */
/* Función para abrir la página de landing */
async function abrirLandingHorarioTimes() {
  // ==========================
  // Carga de datos
  // ==========================
  const req = new Request(DATA_URL);
  const semanas = await req.loadJSON();
  const semanaActual = semanas[semanas.length - 1];

  // ==========================
  // Nombre del usuario desde parámetro o default
  // ==========================
  let nombreParametro = usuarioOriginal
    ? usuarioOriginal.trim()
    : "Invitado";
  
  // Normalizamos texto para buscar coincidencia
  function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  
  // Buscar trabajador en la semana actual
  const trabajadorEncontrado = semanaActual.trabajadores.find(t =>
    normalizarTexto(t.nombre).startsWith(normalizarTexto(nombreParametro))
  );
  
  // ⚠️ Si NO existe el trabajador en esta semana → NO enviar nombre al HTML
  if (!trabajadorEncontrado) {
    return {
      semana: semanaActual,
      miNombre: null,   // ← muy importante
    };
  }
  
  const MI_NOMBRE = trabajadorEncontrado.nombre;
  const primerNombre = MI_NOMBRE.split(" ")[0];


  // ==========================
  // Payload para HTML
  // ==========================
  const payload = {
    semana: semanaActual,
    miNombre: MI_NOMBRE,
  };
  const payloadJSON = JSON.stringify(payload);

  // ==========================
  // HTML embebido
  // ==========================
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Timesburg · Jornadas – 4Bdev®</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

<style>
:root {
  --bg: #05060a;
  --bg-elevated: rgba(18, 22, 30, 0.92);
  --bg-soft: rgba(26, 32, 44, 0.9);
  --accent: #00e46e;
  --accent-soft: rgba(61, 255, 152, 0.15);
  --accent-strong: #00e46e;
  --estimado: #e4e400b8;
  --estimado-soft: rgba(255, 242, 61, 0.1);
  --estimado-strong: #e4e400;

  --border-soft: rgba(255, 255, 255, 0.1);
  --border-normal: rgba(255, 255, 255, 0.4);
  --text: #f7f7ff;
  --text-soft: #a3a7b7;
  --text-muted: #6d7181;
  --danger: #ff4664;
  --success: #34d399;
  --shadow-soft: 0 18px 45px rgba(0,0,0,0.6);
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-pill: 999px;
  --blur-level: 24px;
  --nav-height: 56px;
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --font-main: -apple-system, system-ui, -apple-system-ui-serif, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* Ocultar scrollbar en Firefox */
* {
  scrollbar-width: none;
}

/* Ocultar scrollbar en Edge/Chrome */
*::-webkit-scrollbar {
  display: none;
}

.meHint {
  text-align: center;
  }


@media (prefers-color-scheme: light) {
  :root {
    --bg: #ecececff; /* fondo total #f3f4f7 */
    --bg-elevated: rgba(0, 0, 0, 0.3); /*  rgba(255, 255, 255, 0.96)*/
    --bg-soft: rgba(244, 245, 248, 0.96);
    --accent: #005d38;
    --accent-soft: rgba(61, 255, 152, 0.12);
    --accent-strong: #00e46eff;
    --estimado: #e4e400ff;
    --estimado-soft: rgba(255, 242, 61, 0.15);
    --estimado-strong: #e4e400ff;
    --border-soft: rgba(15, 23, 42, 0.06);
    --border-normal: rgba(255, 255, 255, 0.4);
    --text: #080c16;
    --text-soft: #4b5566;
    --text-muted: #a7afc6ff; /* 9ca3b8 */
    --shadow-soft: 0 20px 50px rgba(15,23,42,0.18);
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-main);
}

body {
  padding-top: calc(var(--safe-top) + 8px);
  padding-bottom: calc(var(--safe-bottom) + 8px);

  overscroll-behavior: none;
  overflow: hidden; /* evita estiramiento global */
  height: 100%;
}

/* Layout principal */
.app {
  min-height: 90vh; /* 100vh */
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  gap: 12px;
}

/* Barra superior */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px 4px 2px;
}

.app-title {
  display: flex;
  flex-direction: column;
}

.app-title-main {
  font-size: 17px;
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.app-title-sub {
  font-size: 11px;
  color: var(--text-soft);
}

/* Selector de vista / tabs */
.view-tabs {
  display: inline-flex;
  border-radius: var(--radius-pill);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 3px;
  gap: 4px;
}

@media (prefers-color-scheme: light) {
  .view-tabs {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(15, 23, 42, 0.05);
  }
}

.view-tab-btn {
  border: none;
  border-radius: var(--radius-pill);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-soft);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-tab-btn span.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: transparent;
}

.view-tab-btn.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.view-tab-btn.active span.dot {
  background: var(--accent-strong);
}

/* Contenedor de vistas (pantallas) */
.view-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent);
}

/* Cada vista */
.view {
  position: absolute;
  inset: 0;
  padding: 12px;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, var(--bg-soft), var(--bg-elevated));
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateX(12px);
  pointer-events: none;
  transition: opacity 260ms ease-out, transform 260ms ease-out;
}

.view.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Barra interna de cada vista */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border-soft);
}

.view-header-title {
  font-size: 15px;
  font-weight: 600;
}

.view-header-sub {
  font-size: 12px;
  color: var(--text-muted);
}

/* Botón sutil */
.btn-ghost {
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-soft);
  background: rgba(15, 23, 42, 0.4);
  color: var(--text-soft);
  font-size: 12px;
  padding: 5px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-ghost strong {
  color: var(--accent-strong);
}

/* Botones principales */
.btn-primary {
  border-radius: var(--radius-pill);
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #000000;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.btn-primary span.icon {
  font-size: 16px;
  color: #000000;
}

/* Área de contenido scrollable */
.view-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 4px;
}

/* Cards */
.card {
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.84);
  border: 1px solid var(--border-soft);
  padding: 10px 11px;
  margin-bottom: 8px;
}

.proximacard{
  background-color: rgba(24, 72, 36, 0.3);
  border-radius: var(--radius-md);
  /* background: rgba(15, 23, 42, 0.84); */
  border: 1px solid var(--accent); /* (--border-soft) */
  padding: 10px 11px;
  margin-bottom: 8px;
}

@media (prefers-color-scheme: light) {
  .card {
    background: rgba(255,255,255,0.98);
    border-color: rgba(15,23,42,0.06);
  }
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.card-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.chip {
  border-radius: var(--radius-pill);
  padding: 3px 8px;
  font-size: 11px;
  border: 1px solid var(--border-soft);
  color: var(--text-soft);
  background: rgba(32, 46, 77, 0.7); /* rgba(15,23,42,0.7) */
}
.chip.white {
  border-radius: var(--radius-pill);
  padding: 3px 8px;
  font-size: 11px;
  border: 1px solid var(--border-normal);
  color: var(--text-soft);
  background: rgba(32, 46, 77, 0.7); /* rgba(15,23,42,0.7) */
}

.chip.accent {
  border-color: var(--accent);
  color: var(--accent-strong);
  background: var(--accent-soft);
}

.estimado {
  border-color: var(--estimado);
  color: var(--estimado-strong);
  background: var(--estimado-soft);
}
.estimadofill {
  border-color: var(--estimado-strong);
  color: #000000;
  background: var(--estimado-strong);
}

/* Lista de trabajadores */
.worker-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.worker-item {
  border-radius: var(--radius-md);
  background: rgba(10, 14, 24, 0.9);
  border: 1px solid var(--border-soft);
  padding: 8px 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (prefers-color-scheme: light) {
  .worker-item {
    background: rgba(250,250,255,0.98);
  }
}

.worker-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.worker-name {
  font-size: 13px;
  font-weight: 500;
}

.worker-role {
  font-size: 11px;
  color: var(--text-muted);
}

.worker-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.badge {
  border-radius: var(--radius-pill);
  padding: 2px 7px;
  font-size: 10px;
  border: 1px solid var(--border-soft);
  color: var(--text-soft);
}

.badge-compact {
  font-size: 10px;
  color: var(--text-muted);
}

/* Fila de día */
.day-block {
  border-radius: var(--radius-md);
  background: rgba(10, 14, 24, 0.9);
  border: 1px solid var(--border-soft);
  padding: 7px 9px;
  margin-bottom: 5px;
}

@media (prefers-color-scheme: light) {
  .day-block {
    background: #f1f1f1;
  }
}

.day-block.con-turno {
  background-color: rgba(0, 228, 110, .1); /* color para días con turno */
}

.day-block.sin-turno {
  background-color: rgba(0,0,0,0); /* color para días sin turno */
}


.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.day-name {
  font-size: 12px;
  font-weight: 500;
}

.day-status {
  font-size: 10px;
  color: var(--text-muted);
}

.shift-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--text-soft);
}

.shift-pill {
  border-radius: var(--radius-pill);
  padding: 3px 7px;
  border: 1px solid var(--border-soft);
}

.shift-pill span.label {
  font-weight: 500;
}

/* Barra inferior de acción rápida */
.bottom-bar {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  gap: 6px;
  justify-content: space-between;
}

/* Texto pequeño */
.caption {
  font-size: 11px;
  color: var(--text-muted);
}
.caption strong {
  color: var(--accent-strong);
}

}
</style>
</head>
<body>
<div class="app">

  <header class="app-header">
    <div class="app-title">
      <div class="app-title-main">Timesburg</div>
      <div class="app-title-sub" id="headerSubtitle"></div>
    </div>
    <div class="view-tabs">
      <button class="view-tab-btn active" data-target="home">
        <span class="dot"></span>
        <span>Inicio</span>
      </button>
      <button class="view-tab-btn" data-target="workers">
        <span class="dot"></span>
        <span>Equipo</span>
      </button>
      <button class="view-tab-btn" data-target="me">
        <span class="dot"></span>
        <span>${primerNombre}</span>
      </button>
    </div>
  </header>

  <main class="view-container">
    <!-- Vista Home -->
    <section class="view active" id="view-home">
      <header class="view-header">
        <div>
          <div class="view-header-title" id="homeWeekTitle"></div>
          <div class="view-header-sub" id="homeWeekSub"></div>
        </div>
        <button class="btn-ghost" id="btnTodaySummary">
          Hoy
        </button>
      </header>

      <div class="view-body" id="homeBody"></div>

      <footer class="bottom-bar">
        <button class="btn-primary" id="btnGoToMe">
          <span class="icon">▶︎</span>
          <span>Ver mi siguiente jornada</span>
        </button>
      </footer>
    </section>

    <!-- Vista trabajadores -->
    <section class="view" id="view-workers">
      <header class="view-header">
        <div>
          <div class="view-header-title">Equipo</div>
          <div class="view-header-sub" id="workersSub"></div>
        </div>
        <button class="btn-ghost" id="btnScrollTopWorkers">
          Arriba
        </button>
      </header>

      <div class="view-body">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Resumen</div>
            <div class="card-subtitle" id="workersSummary"></div>
          </div>
          <div class="chip-row" id="workersChips"></div>
        </div>

        <div class="worker-list" id="workerList"></div>
      </div>
    </section>

    <!-- Vista Mi jornada -->
    <section class="view" id="view-me">
      <header class="view-header">
        <div>
          <div class="view-header-title" id="meTitle"></div>
          <div class="view-header-sub" id="meSub"></div>
        </div>
        <button class="btn-ghost" id="btnBackToHome">
          Volver a inicio
        </button>
      </header>

      <div class="view-body" id="meBody"></div>

      <footer class="bottom-bar">
        <div class="caption" id="meHint"></div>
      </footer>
    </section>
  </main>
</div>


<script>
// =======================
// Datos desde Scriptable
// =======================
const PAYLOAD = ${payloadJSON};

// Helpers
const DIAS_ORDEN = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
const LABEL_DIA = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo"
};

function diaActualClave() {
  const js = new Date().getDay(); // 0 = domingo
  return ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"][js];
}

function formatearHoraDiff(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0 && m <= 0) return "Ahora mismo";
  if (h === 0) return m + "min";
  if (m === 0) return h + "h";
  return h + "h " + m + "min";
}

function parseHoraOffset(hora, offsetDias) {
  if (!hora || !hora.trim()) return null;
  const [H,M] = hora.split(":").map(Number);
  const d = new Date();
  d.setHours(H, M, 0, 0);
  d.setDate(d.getDate() + offsetDias);
  return d;
}

// =======================
// Navegación básica
// =======================
const tabs = document.querySelectorAll(".view-tab-btn");
const views = {
  home: document.getElementById("view-home"),
  workers: document.getElementById("view-workers"),
  me: document.getElementById("view-me"),
};

function setActiveView(viewName) {
  tabs.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.target === viewName);
  });
  Object.entries(views).forEach(([name, el]) => {
    el.classList.toggle("active", name === viewName);
  });
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    setActiveView(btn.dataset.target);
  });
});

// =======================
// Home: resumen de semana
// =======================
function renderHome() {
  const semana = PAYLOAD.semana;
  const headerSubtitle = document.getElementById("headerSubtitle");
  const homeWeekTitle = document.getElementById("homeWeekTitle");
  const homeWeekSub = document.getElementById("homeWeekSub");
  const homeBody = document.getElementById("homeBody");

  headerSubtitle.textContent = semana.nombre || "Semana actual";
  homeWeekTitle.textContent = semana.nombre || "Semana";
  homeWeekSub.textContent = "Trabajadores: " + (semana.trabajadores?.length || 0);

  const hoyClave = diaActualClave();
  const hoyLabel = LABEL_DIA[hoyClave] || "Hoy";

  // Card de "Hoy en el equipo"
  let cardHTML = "";

  cardHTML += '<div class="card">';
  cardHTML += '  <div class="card-header">';
  cardHTML += '    <div class="card-title">Hoy · ' + hoyLabel + '</div>';
  cardHTML += '    <div class="card-subtitle">Vista rápida del equipo</div>';
  cardHTML += '  </div>';

  let enTurno = [];
  let entranDespues = [];

  const ahora = new Date();
  const idxHoy = DIAS_ORDEN.indexOf(hoyClave);

  (semana.trabajadores || []).forEach(t => {
    const horarioHoy = t.horarios?.[hoyClave];
    if (!horarioHoy) return;

    const turnos = [
      {nombre: "mediodía", horas: horarioHoy.mediodia},
      {nombre: "noche", horas: horarioHoy.noche},
    ];

    let tieneAlgo = false;

    for (let turno of turnos) {
      const [ini, fin] = turno.horas || ["",""];
      if (!ini || !fin || !ini.trim() || !fin.trim()) continue;

      const inicio = parseHoraOffset(ini, 0);
      const finD = parseHoraOffset(fin, 0);
      if (finD < inicio) finD.setDate(finD.getDate() + 1);

      if (ahora >= inicio && ahora <= finD) {
        enTurno.push({
          nombre: t.nombre,
          plaza: t.plaza,
          turno: turno.nombre,
          tramo: ini + "–" + fin
        });
        tieneAlgo = true;
      } else if (ahora < inicio) {
        const diff = inicio - ahora;
        entranDespues.push({
          nombre: t.nombre,
          plaza: t.plaza,
          turno: turno.nombre,
          tramo: ini + "–" + fin,
          diff,
        });
        tieneAlgo = true;
      }
    }

    if (!tieneAlgo) return;
  });

  if (!enTurno.length && !entranDespues.length) {
    cardHTML += '<div class="caption">Hoy no hay turnos activos registrados.</div>';
  } else {
    if (enTurno.length) {
      cardHTML += '<div class="chip-row">';
      enTurno.forEach(e => {
        cardHTML += '<div class="chip accent">';
        cardHTML += e.nombre + ' · ' + e.turno + ' (' + e.tramo + ')';
        cardHTML += '</div>';
      });
      cardHTML += '</div>';
    }
    if (entranDespues.length) {
      entranDespues.sort((a,b) => a.diff - b.diff);
      cardHTML += '<div class="chip-row" style="margin-top:6px;">';
      entranDespues.slice(0,4).forEach(e => {
        cardHTML += '<div class="chip">';
        cardHTML += e.nombre + ' en ' + formatearHoraDiff(e.diff);
        cardHTML += '</div>';
      });
      cardHTML += '</div>';
    }
  }

  cardHTML += '</div>';

  // Card de estadísticas sencillas
  let totalContratadas = 0;
  let totalComplementarias = 0;
  semana.trabajadores.forEach(t => {
    totalContratadas += t.contratadas || 0;
    totalComplementarias += t.complementarias || 0;
  });
  const totalTrab = semana.trabajadores.length;

  cardHTML += '<div class="card">';
  cardHTML += '  <div class="card-header">';
  cardHTML += '    <div class="card-title">Cifras rápidas</div>';
  cardHTML += '    <div class="card-subtitle">Semana del equipo</div>';
  cardHTML += '  </div>';
  cardHTML += '  <div class="chip-row">';
  cardHTML += '    <div class="chip">Trabajadores: ' + totalTrab + '</div>';
  cardHTML += '    <div class="chip">Horas contratadas: ' + totalContratadas + '</div>';
  cardHTML += '    <div class="chip">Horas complementarias: ' + totalComplementarias + '</div>';
  cardHTML += '  </div>';
  cardHTML += '</div>';

  homeBody.innerHTML = cardHTML;
}

// =======================
// Vista de trabajadores
// =======================
function renderWorkers() {
  const semana = PAYLOAD.semana;
  const workersSub = document.getElementById("workersSub");
  const workersSummary = document.getElementById("workersSummary");
  const workersChips = document.getElementById("workersChips");
  const workerList = document.getElementById("workerList");

  const total = semana.trabajadores.length;
  workersSub.textContent = total + " trabajadores registrados";

  let totalContratadas = 0;
  let totalComplementarias = 0;
  semana.trabajadores.forEach(t => {
    totalContratadas += t.contratadas || 0;
    totalComplementarias += t.complementarias || 0;
  });
  workersSummary.textContent = totalContratadas + "h contratadas · " + totalComplementarias + "h comp.";

  workersChips.innerHTML = "";
  const chip1 = document.createElement("div");
  chip1.className = "chip";
  chip1.textContent = "Semana: " + (semana.nombre || "");
  workersChips.appendChild(chip1);

  const chip2 = document.createElement("div");
  chip2.className = "chip";
  chip2.textContent = "Días: " + DIAS_ORDEN.length;
  workersChips.appendChild(chip2);

  workerList.innerHTML = "";
  semana.trabajadores.forEach(t => {
    const item = document.createElement("div");
    item.className = "worker-item";

    const main = document.createElement("div");
    main.className = "worker-main";

    const nameEl = document.createElement("div");
    nameEl.className = "worker-name";
    nameEl.textContent = t.nombre;

    const roleEl = document.createElement("div");
    roleEl.className = "worker-role";
    roleEl.textContent = t.plaza || "Sin plaza";

    main.appendChild(nameEl);
    main.appendChild(roleEl);

    const meta = document.createElement("div");
    meta.className = "worker-meta";

    const badge1 = document.createElement("div");
    badge1.className = "badge";
    badge1.textContent = (t.contratadas || 0) + "h contratadas";

    const badge2 = document.createElement("div");
    badge2.className = "badge-compact";
    badge2.textContent = (t.complementarias || 0) + "h comp.";

    meta.appendChild(badge1);
    meta.appendChild(badge2);

    item.appendChild(main);
    item.appendChild(meta);

    item.addEventListener("click", () => {
      renderWorkerDetail(t);
    });

    workerList.appendChild(item);
  });
}

// =======================
// Vista detalle de un trabajador en “Mi jornada”
// =======================
function encontrarTrabajador(nombre) {
  return PAYLOAD.semana.trabajadores.find(t => t.nombre === nombre) || null;
}

function calcularProximaJornada(trabajador) {
  const ahora = new Date();
  const hoyClave = diaActualClave();
  const idxHoy = DIAS_ORDEN.indexOf(hoyClave);

  let proxima = null;

  for (let offset = 0; offset < 7; offset++) {
    const idxDia = (idxHoy + offset) % 7;
    const diaClave = DIAS_ORDEN[idxDia];
    const horario = trabajador.horarios?.[diaClave];
    if (!horario) continue;

    const turnos = [
      { nombre: "mediodía", horas: horario.mediodia },
      { nombre: "noche", horas: horario.noche }
    ];

    for (let turno of turnos) {
      const [iniStr, finStr] = turno.horas || ["",""];
      if (!iniStr || !finStr || !iniStr.trim() || !finStr.trim()) continue;

      const inicio = parseHoraOffset(iniStr, offset);
      const fin = parseHoraOffset(finStr, offset);
      if (fin < inicio) fin.setDate(fin.getDate() + 1);

      const esHoy = offset === 0;
      const turnoValido = (esHoy && ahora < fin) || (!esHoy);

      if (turnoValido) {
        proxima = {
          diaClave,
          diaLabel: LABEL_DIA[diaClave],
          turno: turno.nombre,
          iniStr,
          finStr,
          inicioDate: inicio
        };
        return proxima;
      }
    }
  }
  return null;
}





// =========================
// ESTIMACIÓN SALARIAL
// =========================

// Calcula horas decimales entre dos horas HH:MM
function horasEntre(horaIni, horaFin) {
  const partesIni = horaIni.split(":").map(Number);
  const partesFin = horaFin.split(":").map(Number);

  const h1 = partesIni[0];
  const m1 = partesIni[1];
  const h2 = partesFin[0];
  const m2 = partesFin[1];

  const ini = h1 + m1 / 60;
  const fin = h2 + m2 / 60;

  return Math.max(0, fin - ini);
}

// Convierte horas decimales a formato humano:
// 5h, 3h 30m, 45m, 0h
function formatearHorasHumanas(horasDecimales) {
  if (!horasDecimales || horasDecimales <= 0) {
    return "0h";
  }

  const horas = Math.floor(horasDecimales);
  const minutos = Math.round((horasDecimales - horas) * 60);

  if (horas > 0 && minutos > 0) {
    return horas + "h " + minutos + "m";
  }
  if (horas > 0 && minutos === 0) {
    return horas + "h";
  }
  if (horas === 0 && minutos > 0) {
    return minutos + "m";
  }

  return "0h";
}




function renderWorkerDetail(t) {
  // Usamos la vista "me" como detalle, pero sin perder la posibilidad de volver a "Equipo"
  setActiveView("me");
  const meTitle = document.getElementById("meTitle");
  const meSub = document.getElementById("meSub");
  const meBody = document.getElementById("meBody");
  const meHint = document.getElementById("meHint");

  meTitle.textContent = t.nombre;
  meSub.textContent = t.plaza || "Trabajador";

  const proxima = calcularProximaJornada(t);
  const hoyClave = diaActualClave();
  const hoyLabel = LABEL_DIA[hoyClave];

  let html = "";

  // Card próxima jornada
  html += '<div class="proximacard">';
  html += '  <div class="card-header">';
  html += '    <div class="card-title">Próxima jornada</div>';
  html += '    <div class="card-subtitle">Según el horario de la semana</div>';
  html += '  </div>';

  if (!proxima) {
    html += '<div class="caption">No hay más jornadas asignadas esta semana.</div>';
  } else {
    const diff = proxima.inicioDate - new Date();
    const falta = diff > 0 ? formatearHoraDiff(diff) : "En curso";

    html += '<div class="chip-row">';
    html += '  <div class="chip accent">' + proxima.diaLabel + ' · ' + proxima.turno + '</div>';
    html += '</div>';

    html += '<div class="chip-row" style="margin-top:4px;">';
    html += '  <div class="chip">Horario: ' + proxima.iniStr + '–' + proxima.finStr + '</div>';
    html += '  <div class="chip">Faltan: ' + falta + '</div>';
    html += '</div>';
  }
  html += '</div>';

  // Card jornada de hoy
  html += '<div class="card">';
  html += '  <div class="card-header">';
  html += '    <div class="card-title">Hoy · ' + hoyLabel + '</div>';
  html += '    <div class="card-subtitle">Turnos de hoy</div>';
  html += '  </div>';

  const hoyHorario = t.horarios?.[hoyClave];
  if (!hoyHorario) {
    html += '<div class="caption">No hay turnos programados hoy.</div>';
  } else {
    html += '<div class="shift-row">';
    if (hoyHorario.mediodia && hoyHorario.mediodia[0]) {
      html += '<div class="shift-pill">';
      html += '<span class="label">Mediodía</span>: ' + hoyHorario.mediodia[0] + '–' + hoyHorario.mediodia[1];
      html += '</div>';
    }
    if (hoyHorario.noche && hoyHorario.noche[0]) {
      html += '<div class="shift-pill">';
      html += '<span class="label">Noche</span>: ' + hoyHorario.noche[0] + '–' + hoyHorario.noche[1];
      html += '</div>';
    }
    if (!hoyHorario.mediodia[0] && !hoyHorario.noche[0]) {
      html += '<div class="caption">No tienes turnos hoy.</div>';
    }
    html += '</div>';
  }
  html += '</div>';

  // Card jornadas de la semana
  html += '<div class="card">';
  html += '  <div class="card-header">';
  html += '    <div class="card-title">Semana completa</div>';
  html += '    <div class="card-subtitle">Todos los días de la semana</div>';
  html += '  </div>';

  DIAS_ORDEN.forEach(dia => {
    const h = t.horarios?.[dia];
    if (!h) return;
    const vacio = (!h.mediodia[0] && !h.noche[0]);
    html += '<div class="day-block ' + (vacio ? 'sin-turno' : 'con-turno') + '">';
    /* html += '<div class="day-block">'; */
    html += '  <div class="day-header">';
    html += '    <div class="day-name">' + (LABEL_DIA[dia] || dia) + '</div>';
    
    html += '    <div class="day-status">';
    html += vacio ? 'Día libre' : 'Con turno';
    html += '    </div>';
    html += '  </div>';
    if (vacio) {
      html += '<div class="caption">Sin horario asignado.</div>';
    } else {
      html += '<div class="shift-row">';
      if (h.mediodia[0]) {
        html += '<div class="shift-pill"><span class="label">Mediodía</span>: ' + h.mediodia[0] + '–' + h.mediodia[1] + '</div>';
      }
      if (h.noche[0]) {
        html += '<div class="shift-pill"><span class="label">Noche</span>: ' + h.noche[0] + '–' + h.noche[1] + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  });

  html += '</div>';




  
// =========================
// Cálculo de nocturnidad
// =========================
function horasNocturnas(inicio, fin) {
  const NOCT_INI = "22:00";
  const NOCT_FIN = "03:00";

  const aMin = t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  let ini = aMin(inicio);
  let finMin = aMin(fin);

  // Si pasa de medianoche
  if (finMin < ini) finMin += 24 * 60;

  const noctIni = aMin(NOCT_INI);
  let noctFin = aMin(NOCT_FIN) + 24 * 60;

  const iniSol = Math.max(ini, noctIni);
  const finSol = Math.min(finMin, noctFin);

  return Math.max(0, (finSol - iniSol) / 60);
}

// =========================
// Cálculo semanal
// =========================
let horasSemana = 0;
let horasNocturnasSemana = 0;

DIAS_ORDEN.forEach(dia => {
  const h = t.horarios?.[dia];
  if (!h) return;

  // Mediodía
  if (h.mediodia && h.mediodia[0] && h.mediodia[1]) {
    horasSemana += horasEntre(h.mediodia[0], h.mediodia[1]);
    horasNocturnasSemana += horasNocturnas(h.mediodia[0], h.mediodia[1]);
  }

  // Noche
  if (h.noche && h.noche[0] && h.noche[1]) {
    horasSemana += horasEntre(h.noche[0], h.noche[1]);
    horasNocturnasSemana += horasNocturnas(h.noche[0], h.noche[1]);
  }
});

// =========================
// Cálculo económico
// =========================
const precioHora = 11.25;
const precioNocturnidad = 2.85;

const salarioEstimado = horasSemana * precioHora;
const totalNocturnidad = horasNocturnasSemana * precioNocturnidad;
// =========================
// HTML
// =========================
html += '<div class="card estimado">';
html += '  <div class="card-header">';
html += '    <div class="card-title">Estimación salarial</div>';
html += '    <div class="card-subtitle">Aproximación semanal<br>simple sin festivos</div>';
html += '  </div>';

html += '  <div style="height:8px;"></div>';

// --- BLOQUE HORAS BASE ---
html += '  <div class="chip-row" style="margin-top:4px;">';
html += '    <div class="chip white">Valor hora: ' + precioHora.toFixed(2) + '€</div>';
html += '    <div class="chip estimado">' + formatearHorasHumanas(horasSemana) + '</div>';
html += '    <div class="chip estimado">Total base: ' + salarioEstimado.toFixed(2) + ' €</div>';
html += '  </div>';

// --- BLOQUE NOCTURNIDAD ---
html += '  <div class="chip-row" style="margin-top:4px;">';
html += '    <div class="chip white">Valor noct: 2.85€</div>';
html += '    <div class="chip estimado">' + formatearHorasHumanas(horasNocturnasSemana) + '</div>';
html += '    <div class="chip estimado">Total nocturno: ' + totalNocturnidad.toFixed(2) + '€</div>';
html += '  </div>';

// --- SALTO DE LÍNEA ---
html += '  <div style="height:12px;"></div>';

// --- TOTAL FINAL ---
const totalFinal = salarioEstimado + totalNocturnidad;

html += '  <div class="chip-row" style="margin-top:4px;">';
html += '    <div class="chip estimadofill" style="font-weight:bold;">TOTAL ESTIMADO: ' + totalFinal.toFixed(2) + '€</div>';
html += '  </div>';

html += '</div>';






  meBody.innerHTML = html;
  meHint.textContent = "4Bdev® – 2025©";
}

// =======================
// Vista “Mi jornada” para Ali
// =======================
function renderMe() {
  const t = encontrarTrabajador(PAYLOAD.miNombre);
  if (!t) {
    document.getElementById("meTitle").textContent = PAYLOAD.miNombre;
    document.getElementById("meSub").textContent = "No se encontró en la semana actual";
    document.getElementById("meBody").innerHTML = '<div class="caption">Verifica que el nombre coincide exactamente.</div>';
    return;
  }
  renderWorkerDetail(t);
}

// =======================
// Controles varios
// =======================
document.getElementById("btnGoToMe").addEventListener("click", () => {
  setActiveView("me");
  renderMe();
});

document.getElementById("btnBackToHome").addEventListener("click", () => {
  setActiveView("home");
});

document.getElementById("btnTodaySummary").addEventListener("click", () => {
  setActiveView("home");
  const body = document.getElementById("homeBody");
  body.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("btnScrollTopWorkers").addEventListener("click", () => {
  setActiveView("workers");
});

// Inicializar vistas
renderHome();
renderWorkers();
renderMe(); // precargar datos
</script>

</body>
</html>
`
// ==========================
// Mostrar en WebView
// ==========================
if (!config.runsInWidget) {
  const wv = new WebView();
  await wv.loadURL("https://ali-bhtty.web.app");
  await wv.evaluateJavaScript(`
    document.open();
    document.write(\`${html.replace(/`/g, "\\`")}\`);
    document.close();
  `, false);
  await wv.present();
  Script.complete();
  return;
}

}


// ========================================================
// ===================== SECCIONES ========================
// ========================================================
function addSection(widget, title, lista, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor, numRowsGlobal) {
  const t = widget.addText(title);
  t.font = Font.boldSystemFont(13);
  t.textColor = new Color("#EFDECD");
  widget.addSpacer(4);

  let row = widget.addStack();
  row.layoutHorizontally();
  row.spacing = 4;

  lista.forEach((trab, i) => {
    if (i % 3 === 0 && i !== 0) {
      row = widget.addStack();
      row.layoutHorizontally();
      row.spacing = 4;
    }

    const cardContainer = row.addStack();
    cardContainer.layoutVertically();

    renderCard(
      cardContainer,
      trab,
      dia,
      turno,
      openers,
      closers,
      aperturaColor,
      cierreColor,
      textoColor,
      numRowsGlobal
    );
  });
}

function horaAMinutos(h) {
  const [hh, mm] = h.split(":").map(Number)
  return hh * 60 + mm
}

function mereceHamburguesa(trab, dia, turno) {
  const horario = trab.horarios?.[dia]?.[turno]
  if (!horario || horario.length !== 2) return false

  let [ini, fin] = horario
  if (!ini || !fin) return false

  const iniMin = horaAMinutos(ini)

  let finMin = horaAMinutos(fin)
  if (fin === "00:00") finMin = 24 * 60
  if (finMin < iniMin) finMin += 24 * 60 // cruza medianoche

  const duracion = (finMin - iniMin) / 60

  // 🍔 MEDIODÍA
  if (turno === "mediodia") {
    return iniMin <= horaAMinutos("12:30") && duracion >= 4
  }

  // 🍔 NOCHE
  if (turno === "noche") {
    return iniMin <= horaAMinutos("19:00") && finMin >= horaAMinutos("24:00")
  }

  return false
}

function renderCard(parent, trab, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor, numRows) {
  const card = parent.addStack();
  card.layoutVertically();

  const param = args.widgetParameter?.toLowerCase();
  const nombreSinIconos = trab.nombre.replace(/[^\w\s]/gi, "");
  const primerNombre = nombreSinIconos.split(" ")[0].toLowerCase();
  const esTrabajadorSeleccionado = param && primerNombre === param;

  card.backgroundColor = esTrabajadorSeleccionado
    ? new Color("#000000", 0.2)
    : new Color("#EFDECD", 0.15);

  card.cornerRadius = 8;

  // ✅ Padding según número de filas
  if (numRows === 3) {
    card.setPadding(1.5, 8, 1.5, 8);
  } else if (numRows === 2) {
    card.setPadding(4, 8, 4, 8);
  } else {
    card.setPadding(9, 8, 9, 8);
  }

  // ✅ Tamaño de texto dinámico
  let fontSize;
  if (numRows === 3) fontSize = 9;
  else if (numRows === 2) fontSize = 10;
  else fontSize = 11;

  const nameRow = card.addStack()
  nameRow.layoutHorizontally()
  nameRow.centerAlignContent()
  
  const n = nameRow.addText(trab.nombre)
  n.font = Font.boldSystemFont(fontSize)
  n.textColor = textoColor
  
  // 🍔 icono hamburguesa
  if (mereceHamburguesa(trab, dia, turno)) {
    nameRow.addSpacer(3)
    const burger = nameRow.addText("🍔")
    burger.font = Font.systemFont(fontSize - 2)
    //burger.font = Font.systemFont(fontSize)
  }
  
  card.addSpacer(2)




  const row = card.addStack();
  const [ini, fin] = trab.horarios[dia][turno];

  const t1 = row.addText(ini);
  t1.font = Font.boldSystemFont(fontSize);
  t1.textColor = openers.includes(trab.nombre) ? aperturaColor : textoColor;

  row.addText(" - ").font = Font.systemFont(fontSize - 1);

  const t2 = row.addText(fin);
  t2.font = Font.boldSystemFont(fontSize);
  t2.textColor = closers.includes(trab.nombre) ? cierreColor : textoColor;

  parent.addSpacer(4);
}

// ========================================================
// ============ CALCULO DE HORAS SEMANALES =================
// ========================================================
function diffHoras(h1, h2) {
  if (!h1 || !h2) return 0;

  let [hIni, mIni] = h1.split(":").map(Number);
  let [hFin, mFin] = h2.split(":").map(Number);

  // ⬅️ 00:00 significa fin del día
  if (hFin === 0 && mFin === 0) {
    hFin = 24;
  }

  let inicio = hIni + mIni / 60;
  let fin = hFin + mFin / 60;

  // ⬅️ Cruza medianoche (ej: 19:00 → 01:00)
  if (fin < inicio) {
    fin += 24;
  }

  return fin - inicio;
}

function calcularHorasSemana(trabajador) {
  let total = 0;

  const dias = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];

  dias.forEach(dia => {
    const md = trabajador.horarios[dia]?.mediodia ?? [];
    const n  = trabajador.horarios[dia]?.noche ?? [];

    const mdIni = md[0]?.trim() ?? "";
    const mdFin = md[1]?.trim() ?? "";
    if (mdIni && mdFin) {
      total += diffHoras(mdIni, mdFin);
    }

    const nIni = n[0]?.trim() ?? "";
    const nFin = n[1]?.trim() ?? "";
    if (nIni && nFin) {
      total += diffHoras(nIni, nFin);
    }
  });

  return Number(total.toFixed(2));
}

function horasEsperadas(trabajador) {
  return (trabajador.contratadas || 0) + (trabajador.complementarias || 0);
}

// ============ PROXIMA JORNADA =================
function minutosHastaProximaJornada(trabajador) {
  const ahora = new Date();
  const hoyIndex = ahora.getDay(); // 0 domingo
  const dias = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];

  let mejorDiff = null;

  for (let offset = 0; offset < 7; offset++) {
    const diaIndex = (hoyIndex + offset) % 7;
    const diaNombre = dias[diaIndex];
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() + offset);

    ["mediodia", "noche"].forEach(turno => {
      const h = trabajador.horarios[diaNombre]?.[turno]?.[0];
      if (!h || !h.trim()) return;

      const [hh, mm] = h.split(":").map(Number);
      const entrada = new Date(fecha);
      entrada.setHours(hh, mm, 0, 0);

      const diffMin = Math.floor((entrada - ahora) / 60000);
      if (diffMin > 0 && (mejorDiff === null || diffMin < mejorDiff)) {
        mejorDiff = diffMin;
      }
    });
  }

  return mejorDiff; // minutos o null
}
// ========================================================
// ================= TABLA TRABAJADOR =====================
// ========================================================

function renderWorkerTable(widget, trabajador, fechaParaTabla = new Date()) {
  widget.addSpacer(8);

  // Cálculo de horas reales y esperadas
  const horasReal = calcularHorasSemana(trabajador);
  const horasObj  = horasEsperadas(trabajador);
  const descuadre = horasReal !== horasObj;

  // Fila superior
  const titleRow = widget.addStack();
  titleRow.layoutHorizontally();
  titleRow.centerAlignContent();

  const nameText = titleRow.addText(trabajador.nombre);
  nameText.font = Font.boldSystemFont(13);
  nameText.textColor = new Color("#EFDECD");

  titleRow.addSpacer(6);

  function formatHorasDecimal(horasDecimal) {
    const h = Math.floor(horasDecimal);
    const m = Math.round((horasDecimal - h) * 60);
    return m === 0 ? `${h}h` : `${h}:${String(m).padStart(2,"0")}m`;
  }

  const plazaText = titleRow.addText(`${trabajador.plaza} · ${formatHorasDecimal(horasReal)}`);
  plazaText.font = Font.italicSystemFont(10);
  plazaText.textColor = new Color("#EFDECD", 0.7);

  if (descuadre) {
    titleRow.addSpacer(2);
    const alert = titleRow.addText("⚠️");
    alert.font = Font.boldSystemFont(8);
    alert.textColor = new Color("#FFD166");
  }

  titleRow.addSpacer();

  // ===================
  // DÍA ACTUAL SEGÚN PARAMETRO
  // ===================
  const diasSemana = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
  const diaActual = diasSemana[fechaParaTabla.getDay()];

  const tieneJornada =
    (trabajador.horarios[diaActual]?.mediodia?.some(h => h.trim())) ||
    (trabajador.horarios[diaActual]?.noche?.some(h => h.trim()));

  // ===================
  // Día de descanso
  // ===================
  if (!tieneJornada) {
    const frases = [
      "Día libre 😌",
      "A recargar energía ✨",
      "Libre y sabros@ 😏",
      "Alguien dijo extra? 🤑",
      "Tiempo para ti 🌿",
      "Libre y se nota 😏",
      "Modo descanso activado 😌",
      "Pausa bien ganada 🌿",
      "Hoy manda el sofá 🛋️",
      "Cuerpo off, mente on 🧘‍♂️",
      "Hoy se duerme bien 😴",
      "Hoy sin reloj 😏",
      "Hoy no fichas 😏",
      "Hoy no se trabaja… se disfruta 😏",
      "Merecido descanso 💚"
    ];

    // ⏱ bloque de 30 minutos
    const bloqueTiempo = Math.floor(Date.now() / (30 * 60 * 1000));
    
    // 🔀 semilla por trabajador + tiempo
    const seed =
      bloqueTiempo +
      [...trabajador.nombre].reduce((a, c) => a + c.charCodeAt(0), 0);
    
    // índice final
    const index = seed % frases.length;
    const frase = frases[index];

    //const index = Math.floor(Date.now() / (30*60*1000)) % frases.length;
    //const frase = frases[index];

    const btn = titleRow.addStack();
    btn.backgroundColor = new Color("#00cc66",0.25);
    btn.cornerRadius = 8;
    btn.setPadding(3,6,3,6);
    btn.centerAlignContent();

    const txt = btn.addText(frase);
    txt.font = Font.boldSystemFont(8.5);
    txt.textColor = new Color("#00cc66");
  }
  // ===================
  // Entrada / Salida
  // ===================
  else {
    const minutos = minutosHastaProximaJornada(trabajador, fechaParaTabla); // usar fechaParametro
    const absMin = Math.abs(minutos);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    const tiempoTxt = m === 0 ? `${h}h` : `${h}:${String(m).padStart(2,"0")}m`;

    const btn = titleRow.addStack();
    btn.cornerRadius = 10;
    btn.setPadding(3,6,3,6);
    btn.centerAlignContent();

    let txt;
    if (minutos > 0) {
      btn.backgroundColor = new Color("#EFDECD",0.18);
      txt = btn.addText(`Entras en ${tiempoTxt}`);
      txt.textColor = new Color("#EFDECD");
    } else {
      btn.backgroundColor = new Color("#FFD166",0.25);
      txt = btn.addText(`Acabas en ${tiempoTxt}`);
      txt.textColor = new Color("#FFD166");
    }
    txt.font = Font.boldSystemFont(9);
  }

  widget.addSpacer(6);

  // ===================
  // FILA DE DÍAS COMPLETA DE LA SEMANA
  // ===================
  const row = widget.addStack();
  row.layoutHorizontally();
  row.spacing = 2;

  // lunes -> domingo
  const diasSemanaOrdenados = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];

  const totalDiasLibres = diasSemanaOrdenados.filter(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;
    return (!md || md.length === 0 || md.every(h => h.trim() === "")) &&
           (!n  || n.length === 0 || n.every(h => h.trim() === ""));
  }).length;

  const hoy = new Date();
  const indiceHoy = hoy.getDay(); 
  // getDay(): 0=domingo, 1=lunes, 2=martes...
  const nombreHoy = diasSemanaOrdenados[(indiceHoy + 6) % 7]; 
  // Ajuste para que lunes sea el primero

  diasSemanaOrdenados.forEach(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;

    const diaLibre = (!md || md.every(h => h.trim() === "")) &&
                     (!n  || n.every(h => h.trim() === ""));

    const cell = row.addStack();
    cell.layoutVertically();
    cell.cornerRadius = 6;

    const esHoy = (dia === nombreHoy);
    cell.backgroundColor = esHoy
      ? new Color("#000000", 0.25)   // color para HOY FFB347 0.35
      : diaLibre
        ? new Color("#ffffff", 0.29)
        : new Color("#EFDECD", 0.15);
    /* cell.backgroundColor = diaLibre ? new Color("#ffffff", 0.29) : new Color("#EFDECD",0.15); */

    /* if (totalDiasLibres <= 1) {
      cell.size = new Size(diaLibre ? 19 : 49, 35);
      cell.setPadding(diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2);
    } else {
      cell.size = new Size(diaLibre ? 19 : 54, 35);
      cell.setPadding(2,2,2,2);
    } */
   if (totalDiasLibres <= 1) {
      // Caso normal: casi sin días libres
      cell.size = new Size(diaLibre ? 19.2 : 49, 35);
      cell.setPadding(
        diaLibre ? 2 : 2,
        diaLibre ? 2 : 2,
        diaLibre ? 2 : 2,
        diaLibre ? 2 : 2
      );
    
    } else if (totalDiasLibres === 3) {
      // ⭐ Caso especial: 3 días libres → estirar más los días con turno
      cell.size = new Size(diaLibre ? 19.2 : 60.2, 35);
      cell.setPadding(
        diaLibre ? 2 : 3,   // ← días libres NO reciben padding grande
        diaLibre ? 2 : 3,
        diaLibre ? 2 : 3,
        diaLibre ? 2 : 3
      );
    
    } else if (totalDiasLibres === 4) {
      // ⭐ Caso especial: 4 días libres → días con turno aún más anchos
      cell.size = new Size(diaLibre ? 19.2 : 73, 35);
      cell.setPadding(
        diaLibre ? 2 : 3,   // ← días libres padding pequeño
        diaLibre ? 2 : 3,
        diaLibre ? 2 : 3,
        diaLibre ? 2 : 3
      );
    
    } else {
      // Caso general: 2, 5, 6 días libres
      cell.size = new Size(diaLibre ? 19.2 : 52.2, 35);
      cell.setPadding(
        diaLibre ? 2 : 2,   // ← días libres padding pequeño
        diaLibre ? 2 : 2,
        diaLibre ? 2 : 2,
        diaLibre ? 2 : 2
      );
    }


    const d = cell.addText(dia.slice(0,2).toUpperCase());
    d.font = Font.boldSystemFont(7.8);   // ← SIEMPRE el mismo tamaño
    /* d.font = Font.boldSystemFont(
      totalDiasLibres === 1 ? 8.5 :      // un poquito más grande
      totalDiasLibres === 3 ? 9   :      // más grande
      totalDiasLibres === 4 ? 10 :      // aún más grande
      8                                   // tamaño base
    ); */

    d.centerAlignText();
    d.textColor = new Color("#EFDECD");

    cell.addSpacer(2);

    // Mediodía
    const mdStack = cell.addStack();
    mdStack.layoutHorizontally();
    mdStack.cornerRadius = 3;
    
    const mdWidth =
      totalDiasLibres === 1 ? 44 :
      totalDiasLibres === 2 ? 47.5 :
      totalDiasLibres === 4 ? 66 :
      54;
    
    mdStack.size = new Size(mdWidth, 7);
    
    const mdIni = md?.[0]?.trim() ?? "";
    const mdFin = md?.[1]?.trim() ?? "";
    
    if (diaLibre) {
      mdStack.backgroundColor = new Color("#000000",0);
      const mdText = mdStack.addText(" ");
      mdText.textColor = new Color("#000000",0);
    } else {
      mdStack.backgroundColor = (mdIni && mdFin) ? Color.clear() : new Color("#ffffff",0.2);
      const mdText = mdStack.addText(mdIni && mdFin ? `${mdIni}-${mdFin}` : "");
      mdText.font = Font.boldSystemFont(
        totalDiasLibres === 1 ? 6.5 :
        totalDiasLibres === 2 ? 6.8 :
        totalDiasLibres === 3 ? 7.2 :
        totalDiasLibres === 4 ? 7.2 :
        6
      );
      mdText.textColor = new Color("#EFDECD");
      mdText.centerAlignText();
    }
    
    cell.addSpacer(3);
    
    // Noche
    const nStack = cell.addStack();
    nStack.layoutHorizontally();
    nStack.cornerRadius = 3;
    
    const nWidth =
      totalDiasLibres === 1 ? 44 :
      totalDiasLibres === 2 ? 47.5 :
      totalDiasLibres === 4 ? 66 :
      54;
    
    nStack.size = new Size(nWidth, 7);
    
    const nIni = n?.[0]?.trim() ?? "";
    const nFin = n?.[1]?.trim() ?? "";
    
    if (diaLibre) {
      nStack.backgroundColor = new Color("#000000",0);
      const nText = nStack.addText(" ");
      nText.textColor = new Color("#000000",0);
    } else {
      nStack.backgroundColor = (nIni && nFin) ? Color.clear() : new Color("#ffffff",0.2);
      const nText = nStack.addText((nIni && nFin) ? `${nIni}-${nFin}` : "");
      nText.font = Font.boldSystemFont(
        totalDiasLibres === 1 ? 6.5 :
        totalDiasLibres === 2 ? 6.8 :
        totalDiasLibres === 3 ? 7.2 :
        totalDiasLibres === 4 ? 7.2 :
        6
      );
      nText.textColor = new Color("#EFDECD");
      nText.centerAlignText();
    }
  });
}

// ========================================================
// ======================= RUN ============================
// ========================================================

(async () => {
  const usersData = await cargarUsuarios();
  const w = await crearWidget(usersData);

  // Activar URL desde JSON si está configurado
  const widgetUrlConfig = usersData.configuracion_global?.widget_url;

  if (widgetUrlConfig?.activo && widgetUrlConfig?.url) {
    w.url = widgetUrlConfig.url;
  }

  Script.setWidget(w);
  Script.complete();
})();
