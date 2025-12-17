// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// ===========================
//   WIDGET HORARIOTIMES.js
//   4Bdev. – Ali Bhtty
// ===========================

// ========================================================
// ============= 1. DATOS DE SEMANAS COMPLETOS ============
const DATA_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/semanas.json";

const USERS_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/users.json"; 

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


// ========================================================
// ======================= WIDGET =========================
// ========================================================

function mostrarAviso() {
  // desactivado temporalmente
}

async function crearWidget(usersData) {

  // Crear el widget al inicio
  const w = new ListWidget();

  // Bloqueo por suscripción
  const activo = usuarioActivo(usersData);

  // Cargar colores desde el JSON
  const colores = usersData.configuracion_global?.colores || {};

  const bgColor = colores.background
    ? new Color(colores.background.hex, colores.background.opacidad ?? 1)
    : new Color("#00cc66", 0.3);

  const headerColor = colores.header
    ? new Color(colores.header.hex, colores.header.opacidad ?? 1)
    : new Color("#EFDECD", 1);

  const aperturaColor = colores.apertura
    ? new Color(colores.apertura.hex, colores.apertura.opacidad ?? 1)
    : new Color("#00aa44", 1);

  const cierreColor = colores.cierre
    ? new Color(colores.cierre.hex, colores.cierre.opacidad ?? 1)
    : new Color("#f42828", 1);

  const textoColor = colores.texto
    ? new Color(colores.texto.hex, colores.texto.opacidad ?? 1)
    : new Color("#FFFFFF", 0.9);


  if (!activo) {
    w.backgroundColor = bgColor;
    //w.backgroundColor = new Color("#00cc66", 0.3);

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
    boton.backgroundColor = new Color("#000000"); // estilo Apple Pay
    boton.cornerRadius = 20;
    boton.setPadding(12, 22, 12, 22);
    
    // Icono
    const icono = boton.addText("");
    icono.textColor = Color.white();
    icono.font = Font.boldSystemFont(18);
    
    boton.addSpacer(8);
    
    // Texto
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
  
    mostrarAviso(w, usersData);
    return w; // ✅ Devuelve el widget
  }

  // Usar fecha forzada si existe
  const fechaWidget = fechaForzada ?? new Date();
  const dia = diasSemana[fechaWidget.getDay()];
  const week = getWeekNumber(fechaWidget);

  // ⬇️ 1. Cargar semanas REMOTAS
  const semanas = await cargarSemanas();

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
  widget.backgroundColor = colorFondo;

  // ⬇️ 4. Control si no hay datos
  if (!semanas.length) {
    widget.addText("No se pudieron cargar los horarios");
    return widget;
  }

  if (!semana) {
    let msg = widget.addText(`No hay horarios actualizados\npara la semana ${week}`);
    msg.centerAlignText();
    return widget;
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
  h1_right.textColor = new Color(headerColor.hex, 0.5); 
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

  addSection(widget, "Mediodía", mediodia, dia, "mediodia",
    getOpeners(mediodia, dia, "mediodia"),
    getClosers(mediodia, dia, "mediodia", "17:00"),
    aperturaColor, cierreColor, textoColor
);

addSection(widget, "Noche", noche, dia, "noche",
    getOpeners(noche, dia, "noche"),
    getClosers(noche, dia, "noche", "03:00"),
    aperturaColor, cierreColor, textoColor
);

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
    avisoStack.setPadding(2,6,2,6);
  
    const t = avisoStack.addText(aviso.texto);
    t.font = Font.boldSystemFont(9);
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

// ========================================================
// ===================== SECCIONES ========================
// ========================================================
function addSection(widget, title, lista, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor) {
  const t = widget.addText(title);
  t.font = Font.boldSystemFont(13);
  t.textColor = new Color("#EFDECD");
  widget.addSpacer(4);

  const grid = widget.addStack();
  grid.layoutHorizontally();
  grid.spacing = 4;

  const numCols = 3; // número máximo de columnas
  const cols = Array.from({ length: numCols }, () => {
    const c = grid.addStack();
    c.layoutVertically();
    c.widthWeight = 1;
    return c;
  });

  // 🔹 calcular cuántas filas habrá en las columnas
  const numRows = Math.ceil(lista.length / numCols);

  // 🔹 pasar numRows a renderCard para ajustar padding y tamaño
  lista.forEach((trab, i) => {
    renderCard(
      cols[i % numCols],
      trab,
      dia,
      turno,
      openers,
      closers,
      aperturaColor,
      cierreColor,
      textoColor,
      numRows // esto es lo que renderCard usa para cambiar padding/texto
    );
  });
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
    card.setPadding(6, 8, 6, 8);
  } else {
    card.setPadding(9, 8, 9, 8);
  }

  // ✅ Tamaño de texto dinámico
  let fontSize;
  if (numRows === 3) fontSize = 9;
  else if (numRows === 2) fontSize = 11;
  else fontSize = 12;

  const n = card.addText(trab.nombre);
  n.font = Font.boldSystemFont(fontSize);
  n.textColor = textoColor;
  card.addSpacer(2);

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

  diasSemanaOrdenados.forEach(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;

    const diaLibre = (!md || md.every(h => h.trim() === "")) &&
                     (!n  || n.every(h => h.trim() === ""));

    const cell = row.addStack();
    cell.layoutVertically();
    cell.cornerRadius = 6;
    cell.backgroundColor = diaLibre ? new Color("#ffffff", 0.29) : new Color("#EFDECD",0.15);

    if (totalDiasLibres <= 1) {
      cell.size = new Size(diaLibre ? 19 : 49, 35);
      cell.setPadding(diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2);
    } else {
      cell.size = new Size(diaLibre ? 19 : 54, 35);
      cell.setPadding(2,2,2,2);
    }

    const d = cell.addText(dia.slice(0,2).toUpperCase());
    d.font = Font.boldSystemFont(8);
    d.centerAlignText();
    d.textColor = new Color("#EFDECD");

    cell.addSpacer(2);

    // Mediodía
    const mdStack = cell.addStack();
    mdStack.layoutHorizontally();
    mdStack.cornerRadius = 3;
    mdStack.size = new Size(totalDiasLibres <= 1 ? 44 : 50, 7);
    const mdIni = md?.[0]?.trim() ?? "";
    const mdFin = md?.[1]?.trim() ?? "";

    if (diaLibre) {
      mdStack.backgroundColor = new Color("#000000",0);
      const mdText = mdStack.addText(" ");
      mdText.textColor = new Color("#000000",0);
    } else {
      mdStack.backgroundColor = (mdIni && mdFin) ? Color.clear() : new Color("#ffffff",0.2);
      const mdText = mdStack.addText(mdIni && mdFin ? `${mdIni}-${mdFin}` : "");
      mdText.font = Font.boldSystemFont(totalDiasLibres <= 1 ? 6 : 7.2);
      mdText.textColor = new Color("#EFDECD");
      mdText.centerAlignText();
    }

    cell.addSpacer(3);

    // Noche
    const nStack = cell.addStack();
    nStack.layoutHorizontally();
    nStack.cornerRadius = 3;
    nStack.size = new Size(totalDiasLibres <= 1 ? 44 : 50, 7);
    const nIni = n?.[0]?.trim() ?? "";
    const nFin = n?.[1]?.trim() ?? "";

    if (diaLibre) {
      nStack.backgroundColor = new Color("#000000",0);
      const nText = nStack.addText(" ");
      nText.textColor = new Color("#000000",0);
    } else {
      nStack.backgroundColor = (nIni && nFin) ? Color.clear() : new Color("#ffffff",0.2);
      const nText = nStack.addText((nIni && nFin) ? `${nIni}-${nFin}` : "");
      nText.font = Font.boldSystemFont(totalDiasLibres <= 1 ? 6 : 7.2);
      nText.textColor = new Color("#EFDECD");
      nText.centerAlignText();
    }
  });
}

// ========================================================
// ======================= RUN ============================
// ========================================================

const usersData = await cargarUsuarios();
const w = await crearWidget(usersData);

// Activar URL desde JSON si está configurado
const widgetUrlConfig = usersData.configuracion_global?.widget_url;

if (widgetUrlConfig?.activo && widgetUrlConfig?.url) {
  w.url = widgetUrlConfig.url;
}

Script.setWidget(w);
Script.complete();
