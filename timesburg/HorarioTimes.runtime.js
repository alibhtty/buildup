// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
// =======================
//   WIDGET HORARIOTIMES.js – 4Bdev. Ali Bhtty
// =======================

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
// ======================= WIDGET =========================
// ========================================================

function mostrarAviso() {
  // desactivado temporalmente
}



async function crearWidget(usersData) {

  // Crear el widget al inicio
  const w = new ListWidget();

  // 🔒 Bloqueo por suscripción
  const activo = usuarioActivo(usersData);


  // Cargar colores globales desde el JSON
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



    /* const fondo = w.addStack();
    fondo.layoutVertically();
    fondo.backgroundColor = bgColor;
    fondo.size = new Size(0, 0); // Se ajusta al widget automáticamente
    fondo.addSpacer(); // Ocupa todo el espacio  */


  if (!activo) {
    w.backgroundColor = bgColor;
    //w.backgroundColor = new Color("#00cc66", 0.3);

    // Frases modernas y motivadoras
    const frases = [
      "🔓 Desbloquea tu semana\nUn widget de tu horario",
      "✨ Premium vibes only\nActiva tu acceso",
      "🚀 Tu horario sin capturas\nSuscríbete ahora",
      "Deja las fotos, vive el widget\nSuscripción necesaria"
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
  
    // Botón de contacto
    const boton = contenedor.addStack();
    boton.layoutHorizontally();
    boton.centerAlignContent();
    boton.backgroundColor = new Color("#FFFFFF", 0.2); // semitransparente
    boton.cornerRadius = 12;
    boton.setPadding(10, 16, 10, 16);
  
    const textoBoton = boton.addText("💬 Suscribirme"); // +34 602 316998
    textoBoton.textColor = Color.white();
    textoBoton.font = Font.boldSystemFont(16);
  
    // Acción al tocar: WhatsApp con mensaje predefinido
    const mensaje = encodeURIComponent("Hola, quiero una licencia de HorarioTimes");
    boton.url = `https://wa.me/34602316998?text=${mensaje}`;
  
    contenedor.addSpacer(); // Espacio flexible a la derecha
  
    w.addSpacer(4);
  
    // Texto debajo del botón
    const t2 = w.addText("La suscripción sirve para mantener\nla actualización continua de datos\n y el desarrollo de este widget.\n\n\nUnofficial – Timesburg®");
    t2.textColor = new Color("#ffffff", 0.65);
    t2.centerAlignText();
    t2.font = Font.systemFont(9);

    w.addSpacer(25);

    const t3 = w.addText("4Bdev® – 2025\nAli Bhtty");
    t3.textColor = new Color("#ffffff", 0.8);
    t3.centerAlignText();
    t3.font = Font.boldSystemFont(10);
  
    mostrarAviso(w, usersData);
    return w; // ✅ Devuelve el widget
  }


  const hoy = new Date();
  const dia = diasSemana[hoy.getDay()];
  const week = getWeekNumber(hoy);

  // ⬇️ 1. Cargar semanas REMOTAS
  const semanas = await cargarSemanas();

  // ⬇️ 2. Buscar la semana actual
  const semana = semanas.find(s => s.id === week);

  // ⬇️ 3. Crear widget DESPUÉS de tener los datos
  const widget = new ListWidget();
  widget.backgroundColor = bgColor;
  //w.backgroundColor = bgColor;
  //widget.backgroundColor = new Color("#00cc66", 0.3);

  /* mostrarAviso(widget, usersData); */

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


  // ⬇️ A partir de aquí, TODO tu código actual tal cual
  // header, secciones, tablas, etc...

  // ================= HEADER =================
  const header = widget.addStack();
  header.layoutHorizontally();
  
  // Texto principal: "Hoy LUNES 13 — "
  const h1_left = header.addText(`Hoy ${dia.toUpperCase()} ${hoy.getDate()} `);
  h1_left.font = Font.boldSystemFont(12);
  h1_left.textColor = headerColor; 
  //h1_left.textColor = new Color("#EFDECD"); // color base
  
  // Texto "Sem 50" con opacidad 0.5
  const h1_right = header.addText(`— Sem ${semana.id}`);
  h1_right.font = Font.italicSystemFont(10);
  h1_right.textColor = new Color(headerColor.hex, 0.5); 
  // h1_right.textColor = new Color("#EFDECD", 0.5); // mismo color pero semitransparente
  
  header.addSpacer();

  // Texto derecho: TIMESBURG y Sant Pau
  const rightStack = header.addStack();
  rightStack.layoutHorizontally();
  rightStack.centerAlignContent();
  
  const h2a = rightStack.addText("Timesburg ");
  h2a.font = Font.boldSystemFont(12);
  h2a.textColor = headerColor;
  //h2a.textColor = new Color("#EFDECD");
  
  const h2b = rightStack.addText("Sant Pau");
  h2b.font = Font.italicSystemFont(12);
  h2b.textColor = headerColor;
  // h2b.textColor = new Color("#EFDECD");

  widget.addSpacer(2);
  
  // --- Línea horizontal debajo del header ---
  const linea = widget.addStack(); // stack separado, no dentro de header
  linea.layoutHorizontally();
  linea.size = new Size(0, 0.8); // altura 1px
  linea.backgroundColor = new Color(headerColor.hex, 0.3);
  //linea.backgroundColor = new Color("#EFDECD", 0.3);
  linea.addSpacer(); // ocupa todo el ancho del widget
  
  widget.addSpacer(6);

  //const mediodia = semana.trabajadores.filter(t => t.horarios[dia]?.mediodia.length);
  //const noche = semana.trabajadores.filter(t => t.horarios[dia]?.noche.length);

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
  boton.setPadding(3,6,3,6);
  
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

  const cols = Array.from({ length: 3 }, () => {
    const c = grid.addStack();
    c.layoutVertically();
    c.widthWeight = 1;
    return c;
  });

  lista.forEach((trab, i) => {
    renderCard(cols[i % 3], trab, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor);
  });
}

function renderCard(parent, trab, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor) {
  const card = parent.addStack();
  card.layoutVertically();

  // ✅ Si el trabajador coincide con el widgetParameter, cambiar fondo
  const param = args.widgetParameter?.toLowerCase();
  const nombreSinIconos = trab.nombre.replace(/[^\w\s]/gi, "");
  const primerNombre = nombreSinIconos.split(" ")[0].toLowerCase();
  const esTrabajadorSeleccionado = param && primerNombre === param;

  card.backgroundColor = esTrabajadorSeleccionado
    ? new Color("#000000", 0.2)  // color especial para el trabajador seleccionado
    : new Color("#EFDECD", 0.15);  // color normal

  card.cornerRadius = 8;
  card.setPadding(4, 8, 4, 8);

  // Crear texto en la card
  const n = card.addText(trab.nombre);
  n.font = Font.boldSystemFont(11);
  n.textColor = textoColor;
  card.addSpacer(2);

  const row = card.addStack();
  const [ini, fin] = trab.horarios[dia][turno];
  
  const t1 = row.addText(ini);
  t1.font = Font.boldSystemFont(11);
  t1.textColor = openers.includes(trab.nombre) ? aperturaColor : textoColor;
  
  row.addText(" - ").font = Font.systemFont(10);
  
  const t2 = row.addText(fin);
  t2.font = Font.boldSystemFont(11);
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

function renderWorkerTable(widget, trabajador) {
  widget.addSpacer(8);

  // Cálculo de horas reales y esperadas
  const horasReal = calcularHorasSemana(trabajador);   // Devuelve decimal
  const horasObj  = horasEsperadas(trabajador);        // Devuelve decimal
  const descuadre = horasReal !== horasObj;

  // Fila superior
  const titleRow = widget.addStack();
  titleRow.layoutHorizontally();
  titleRow.centerAlignContent();

  // Nombre
  const nameText = titleRow.addText(trabajador.nombre);
  nameText.font = Font.boldSystemFont(13);
  nameText.textColor = new Color("#EFDECD");

  titleRow.addSpacer(6);

  // Función para convertir decimal a h:mm
  function formatHorasDecimal(horasDecimal) {
    const h = Math.floor(horasDecimal);
    const m = Math.round((horasDecimal - h) * 60);
    return m === 0 ? `${h}h` : `${h}:${String(m).padStart(2, "0")}m`;
  }

  // Plaza + horas
  const plazaText = titleRow.addText(
    `${trabajador.plaza} · ${formatHorasDecimal(horasReal)}`
  );
  plazaText.font = Font.italicSystemFont(10);
  plazaText.textColor = new Color("#EFDECD", 0.7);

  // ⚠️ Alerta si no cuadran horas
  if (descuadre) {
    titleRow.addSpacer(2);
    const alert = titleRow.addText("⚠️");
    alert.font = Font.boldSystemFont(8);
    alert.textColor = new Color("#FFD166");
  }

  // Spacer para empujar el botón a la derecha
  titleRow.addSpacer();

  // ===================
  // DÍA ACTUAL
  // ===================
  const diasSemana = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
  const hoy = diasSemana[new Date().getDay()];

  const tieneJornada =
    (trabajador.horarios[hoy]?.mediodia?.some(h => h.trim())) ||
    (trabajador.horarios[hoy]?.noche?.some(h => h.trim()));

  // ===================
  // 🟣 DÍA DE DESCANSO
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
    const index = Math.floor(Date.now() / (30*60*1000)) % frases.length;
    const frase = frases[index];

    const btn = titleRow.addStack();
    btn.backgroundColor = new Color("#00cc66",0.25); // verde descanso
    btn.cornerRadius = 8;
    btn.setPadding(3,6,3,6);
    btn.centerAlignContent();

    const txt = btn.addText(frase);
    txt.font = Font.boldSystemFont(8.5);
    txt.textColor = new Color("#00cc66");
  }
  // ===================
  // 🟢 ENTRADA / 🔴 SALIDA
  // ===================
  else {
    const minutos = minutosHastaProximaJornada(trabajador);
    const absMin = Math.abs(minutos);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;

    const tiempoTxt = m === 0 ? `${h}h` : `${h}:${String(m).padStart(2, "0")}m`;

    const btn = titleRow.addStack();
    btn.cornerRadius = 10;
    btn.setPadding(3,6,3,6);
    btn.centerAlignContent();

    let txt;

    // 🟢 Aún no entra
    if (minutos > 0) {
      btn.backgroundColor = new Color("#EFDECD",0.18);
      txt = btn.addText(`Entras en ${tiempoTxt}`);
      txt.textColor = new Color("#EFDECD");
    }
    // 🔴 Ya está trabajando
    else {
      btn.backgroundColor = new Color("#FFD166",0.25);
      txt = btn.addText(`Acabas en ${tiempoTxt}`);
      txt.textColor = new Color("#FFD166");
    }

    txt.font = Font.boldSystemFont(9);
  }

  widget.addSpacer(6);



  const row = widget.addStack();
  row.layoutHorizontally();
  row.spacing = 2;
  
  // Cambiamos el orden de los días: lunes primero
  const diasSemanaOrdenados = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];

  // 🔎 Contamos cuántos días libres completos hay
  const totalDiasLibres = diasSemanaOrdenados.filter(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;
    return (!md || md.length === 0 || md.every(h => h.trim() === "")) &&
           (!n  || n.length === 0  || n.every(h => h.trim() === ""));
  }).length;
  
  diasSemanaOrdenados.forEach(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;
  
    const diaLibre =
      (!md || md.length === 0 || md.every(h => h.trim() === "")) &&
      (!n  || n.length === 0  || n.every(h => h.trim() === ""));
  
    const cell = row.addStack();
    cell.layoutVertically();
    cell.cornerRadius = 6;
  
    // 🎨 Fondo
    cell.backgroundColor = diaLibre
      ? new Color("#ffffff", 0.29)
      : new Color("#EFDECD", 0.15);
  
    // 🔑 Tamaño dinámico
    if (totalDiasLibres <= 1) {
      cell.size = new Size(diaLibre ? 19 : 49, 35);
      cell.setPadding(diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2, diaLibre ? 1 : 2);
    } else {
      cell.size = new Size(diaLibre ? 19 : 54, 35);
      cell.setPadding(2, 2, 2, 2);
    }
  
    // Día
    const d = cell.addText(dia.slice(0,2).toUpperCase());
    d.font = Font.boldSystemFont(8);
    d.centerAlignText();
    d.textColor = new Color("#EFDECD");
  
    cell.addSpacer(2);
  
    // --- Mediodía ---
    const mdStack = cell.addStack();
    mdStack.layoutHorizontally();
    mdStack.cornerRadius = 3;
    mdStack.size = new Size(totalDiasLibres <= 1 ? 44 : 50, 7);
    //mdStack.size = new Size(50, 7);
  
    const mdIni = md?.[0]?.trim() ?? "";
    const mdFin = md?.[1]?.trim() ?? "";
  
    if (diaLibre) {
      mdStack.backgroundColor = new Color("#000000", 0);
      const mdText = mdStack.addText(" ");
      mdText.textColor = new Color("#000000", 0);
    } else {
      mdStack.backgroundColor = (mdIni && mdFin) ? Color.clear() : new Color("#ffffff", 0.2);
      const mdText = mdStack.addText(mdIni && mdFin ? `${mdIni}-${mdFin}` : "");
      mdText.font = Font.boldSystemFont(totalDiasLibres <= 1 ? 6 : 7.2); // 🔑 fuente dinámica
      mdText.textColor = new Color("#EFDECD");
      mdText.centerAlignText();
    }
  
    cell.addSpacer(3);
  
    // --- Noche ---
    const nStack = cell.addStack();
    nStack.layoutHorizontally();
    nStack.cornerRadius = 3;
    nStack.size = new Size(totalDiasLibres <= 1 ? 44 : 50, 7);
    //nStack.size = new Size(50, 7);
  
    const nIni = n?.[0]?.trim() ?? "";
    const nFin = n?.[1]?.trim() ?? "";
  
    if (diaLibre) {
      nStack.backgroundColor = new Color("#000000", 0);
      const nText = nStack.addText(" ");
      nText.textColor = new Color("#000000", 0);
    } else {
      nStack.backgroundColor = (nIni && nFin) ? Color.clear() : new Color("#ffffff", 0.2);
      const nText = nStack.addText((nIni && nFin) ? `${nIni}-${nFin}` : "");
      nText.font = Font.boldSystemFont(totalDiasLibres <= 1 ? 6 : 7.2); // 🔑 fuente dinámica
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
