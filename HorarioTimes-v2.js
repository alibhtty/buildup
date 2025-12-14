// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: calendar;
// =======================
//   WIDGET HORARIOS HOY
// =======================

// ========================================================
// ============= 1. DATOS DE SEMANAS COMPLETOS ============
const DATA_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/semanas.json"; //https://raw.githubusercontent.com/alibhtty/timesburg/main/public/data/semanas.json


const USERS_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/users.json"; 

async function usuarioActivo() {
  const key = args.widgetParameter?.toLowerCase();
  if (!key) return false; // si no hay parámetro, bloqueamos

  try {
    const req = new Request(USERS_URL);
    const users = await req.loadJSON();
    return users[key]?.active === true;
  } catch (e) {
    console.error("Error cargando usuarios:", e);
    return false;
  }
}

async function cargarSemanas() {
  try {
    const req = new Request(DATA_URL);
    const text = await req.loadString();

    // DEBUG opcional
    // console.log(text);

    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      throw new Error("El JSON no es un array");
    }

    return data;
  } catch (e) {
    console.error("❌ Error cargando semanas:", e);
    return [];
  }
}


// ========================================================
// ====================== UTILIDADES ======================
// ========================================================

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

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

async function crearWidget() {
  // 🔒 Bloqueo por suscripción
  const activo = await usuarioActivo();
  if (!activo) {
    const w = new ListWidget();
    w.backgroundColor = new Color("#00cc66", 0.3);
  
    // Mensaje de bloqueo
    const t = w.addText("Acceso bloqueado\nSuscripción requerida");
    t.textColor = Color.white();
    t.centerAlignText();
  
    w.addSpacer(28); // ⬅️ Dos saltos de línea (aprox)
  
    // Contenedor centrador
    const contenedor = w.addStack();
    contenedor.layoutHorizontally();
    contenedor.centerAlignContent(); // Centrar contenido horizontalmente
    contenedor.addSpacer(); // Espacio flexible a la izquierda
  
    // Botón de contacto
    const boton = contenedor.addStack();
    boton.layoutHorizontally();
    boton.centerAlignContent();
    boton.backgroundColor = new Color("#FFFFFF", 0.2); // semitransparente
    boton.cornerRadius = 12;
    boton.setPadding(10, 12, 10, 12);
  
    const textoBoton = boton.addText("💬 Suscribirme"); // +34 602 316998
    textoBoton.textColor = Color.white();
    textoBoton.font = Font.boldSystemFont(16);
  
    // Acción al tocar: WhatsApp con mensaje predefinido
    const mensaje = encodeURIComponent("Hola, quiero obtener la licencia del widget – Horario Timesburg Sant Pau");
    boton.url = `https://wa.me/34602316998?text=${mensaje}`;
  
    contenedor.addSpacer(); // Espacio flexible a la derecha
  
    w.addSpacer(6);
  
    // Texto debajo del botón
    const t2 = w.addText("La suscripción sirve para mantener\nel desarrollo y actualizacion continuo\nde este widget y los datos.\n\n\nUnofficial – Timesburg®");
    t2.textColor = new Color("#ffffff", 0.65);
    t2.centerAlignText();
    t2.font = Font.systemFont(9);

    w.addSpacer(25);

    const t3 = w.addText("4Bdev® – 2025\nAli Bhtty");
    t3.textColor = new Color("#ffffff", 0.8);
    t3.centerAlignText();
    t3.font = Font.systemFont(10);
  
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
  widget.backgroundColor = new Color("#00cc66", 0.3);

  // ⬇️ 4. Control si no hay datos
  if (!semanas.length) {
    widget.addText("⚠️ No se pudieron cargar los horarios");
    return widget;
  }

  if (!semana) {
    widget.addText(`No hay horarios para la semana ${week}`);
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
  h1_left.textColor = new Color("#EFDECD"); // color base
  
  // Texto "Sem 50" con opacidad 0.5
  const h1_right = header.addText(`— Sem ${semana.id}`);
  h1_right.font = Font.italicSystemFont(10);
  h1_right.textColor = new Color("#EFDECD", 0.5); // mismo color pero semitransparente
  
  header.addSpacer();

  // Texto derecho: TIMESBURG y Sant Pau
  const rightStack = header.addStack();
  rightStack.layoutHorizontally();
  rightStack.centerAlignContent();
  
  const h2a = rightStack.addText("Timesburg ");
  h2a.font = Font.boldSystemFont(12);
  h2a.textColor = new Color("#EFDECD");
  
  const h2b = rightStack.addText("Sant Pau");
  h2b.font = Font.italicSystemFont(12);
  h2b.textColor = new Color("#EFDECD");

  widget.addSpacer(2);
  
  // --- Línea horizontal debajo del header ---
  const linea = widget.addStack(); // stack separado, no dentro de header
  linea.layoutHorizontally();
  linea.size = new Size(0, 0.8); // altura 1px
  linea.backgroundColor = new Color("#EFDECD", 0.3);
  linea.addSpacer(); // ocupa todo el ancho del widget
  
  widget.addSpacer(6);

  const mediodia = semana.trabajadores.filter(t => t.horarios[dia]?.mediodia.length);
  const noche = semana.trabajadores.filter(t => t.horarios[dia]?.noche.length);

  addSection(widget, "Mediodía", mediodia, dia, "mediodia",
    getOpeners(mediodia, dia, "mediodia"),
    getClosers(mediodia, dia, "mediodia", "17:00")
  );

  widget.addSpacer(6);

  addSection(widget, "Noche", noche, dia, "noche",
    getOpeners(noche, dia, "noche"),
    getClosers(noche, dia, "noche", "03:00")
  );

  widget.addSpacer(8);

  // ================= LEYENDA =================
  const ley = widget.addStack();
  ley.layoutHorizontally();
  ley.centerAlignContent();
  ley.setPadding(0, 0, 0, 0);
  
  // Parte izquierda: Apertura y Cierre
  const left = ley.addStack();
  left.layoutHorizontally();
  left.centerAlignContent();
  
  const a = left.addText("● Apertura ");
  a.font = Font.boldSystemFont(10);
  a.textColor = new Color("#00aa44");
  
  left.addSpacer(6);
  
  const c = left.addText("● Cierre");
  c.font = Font.boldSystemFont(10);
  c.textColor = new Color("#f42828");
  
  // Spacer central que empuja el texto derecho al extremo
  ley.addSpacer();
  
  // Parte derecha: enlace
  const right = ley.addStack();
  right.layoutHorizontally();
  right.centerAlignContent();
  
  const link = right.addText("4Bdev®");
  link.font = Font.boldSystemFont(10);
  link.textColor = new Color("#EFDECD", 0.3);
  link.font = Font.italicSystemFont(10); // solo cursiva
  widget.addSpacer(2);


  // ================= TABLA TRABAJADOR =================
  if (args.widgetParameter) {
    // Línea horizontal
    const linea = widget.addStack();
    linea.layoutHorizontally();
    linea.backgroundColor = new Color("#EFDECD", 0.3);
    linea.size = new Size(0, 0.5); // altura 1px, ancho automático
    const spacer = linea.addSpacer(); // hace que ocupe todo el ancho
    widget.addSpacer(2); // separador
  
    const param = args.widgetParameter.toLowerCase();
    const trabajador = semana.trabajadores.find(t => {
      const nombreSinIconos = t.nombre.replace(/[^\w\s]/gi, "");
      const primerNombre = nombreSinIconos.split(" ")[0].toLowerCase();
      return primerNombre === param;
    });
    if (trabajador) renderWorkerTable(widget, trabajador);
  }

  return widget;
}

// ========================================================
// ===================== SECCIONES ========================
// ========================================================

function addSection(widget, title, lista, dia, turno, openers, closers) {
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
    renderCard(cols[i % 3], trab, dia, turno, openers, closers);
  });
}

function renderCard(parent, trab, dia, turno, openers, closers) {
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

  const n = card.addText(trab.nombre);
  n.font = Font.boldSystemFont(11);
  n.textColor = new Color("#EFDECD", 0.9);

  card.addSpacer(2);

  const row = card.addStack();
  const [ini, fin] = trab.horarios[dia][turno];

  const t1 = row.addText(ini);
  t1.font = Font.boldSystemFont(11);
  t1.textColor = openers.includes(trab.nombre) ? new Color("#00aa44") : new Color("#EFDECD", 0.8);

  row.addText(" - ").font = Font.systemFont(10);

  const t2 = row.addText(fin);
  t2.font = Font.boldSystemFont(11);
  t2.textColor = closers.includes(trab.nombre) ? new Color("#f42828") : new Color("#EFDECD", 0.8);

  parent.addSpacer(4);
}


// ========================================================
// ================= TABLA TRABAJADOR =====================
// ========================================================

function renderWorkerTable(widget, trabajador) {
  widget.addSpacer(10);

  const title = widget.addText(trabajador.nombre);
  title.font = Font.boldSystemFont(14);
  title.textColor = new Color("#EFDECD");

  widget.addSpacer(6);

  const row = widget.addStack();
  row.layoutHorizontally();
  row.spacing = 2;

  // Cambiamos el orden de los días: lunes primero
  const diasSemanaOrdenados = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  diasSemanaOrdenados.forEach(dia => {
    const md = trabajador.horarios[dia]?.mediodia;
    const n  = trabajador.horarios[dia]?.noche;

    // ✅ Determinar si es día libre
    const diaLibre =
      (!md || md.length === 0 || md.every(h => h.trim() === "")) &&
      (!n  || n.length === 0  || n.every(h => h.trim() === ""));

    const cell = row.addStack();
    cell.layoutVertically();
    cell.cornerRadius = 6;

    // 🎨 Fondo y ancho dinámico
    cell.backgroundColor = diaLibre
      ? new Color("#00aa44", 0.28)   // día libre
      : new Color("#EFDECD", 0.1);   // normal

    cell.size = new Size(diaLibre ? 21 : 54, 35);
    cell.setPadding(2, 2, 2, 2);

    // Día
    const d = cell.addText(dia.slice(0,2).toUpperCase());
    d.font = Font.boldSystemFont(8.5);
    d.centerAlignText();
    d.textColor = new Color("#EFDECD");

    // Si es día libre, no mostramos más contenido
    if (diaLibre) return;

    cell.addSpacer(2);

    // Mediodía
    const mdText = cell.addText(md ? `${md[0]}-${md[1]}` : " ");
    mdText.font = Font.boldSystemFont(7.2);
    mdText.textColor = new Color("#EFDECD");

    // Noche
    const nText = cell.addText(n ? `${n[0]}-${n[1]}` : " ");
    nText.font = Font.boldSystemFont(7.2);
    nText.textColor = new Color("#EFDECD");
  });
}

// ========================================================
// ======================= RUN ============================
// ========================================================

const w = await crearWidget();
Script.setWidget(w);
Script.complete();
