/* Función para abrir la página de landing */
async function abrirLandingHorarioTimes() {
  const web = new WebView()

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">

<!-- ❌ Desactivar zoom -->
<meta name="viewport"
  content="width=device-width,
  initial-scale=1.0,
  maximum-scale=1.0,
  user-scalable=no">

<title>HorarioTimes</title>

<style>
:root {
  --bg: #0f1115;
  --card: #1c1c1e;
  --accent: #00cc66;
  --text: #ffffff;
  --muted: #9a9a9a;
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, system-ui;
  background: var(--bg);
  color: var(--text);
}

/* ===== HEADER ===== */
header {
  padding: 18px 20px 16px;
  background: linear-gradient(135deg, #00cc66, #00994d);
}

header h1 {
  margin: 0;
  font-size: 22px;
}

header p {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

/* ===== NAV ===== */
nav {
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow-x: auto;
}

nav button {
  background: var(--card);
  border: none;
  color: var(--text);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  transition: background 0.3s;
}

nav button.active {
  background: var(--accent);
  color: #000;
}

/* ===== SECTIONS ===== */
section {
  display: none;
  padding: 14px 16px 20px;
  animation: fadeIn 0.35s ease;
}

section.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== CARD ===== */
.card {
  background: var(--card);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}

.card h2 {
  margin: 0 0 6px;
  font-size: 15px;
}

.card p, li {
  font-size: 13px;
  line-height: 1.45;
  color: var(--muted);
}

/* ===== IMAGE BLOCK ===== */
.image-block img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 8px;
}

/* ===== FAQ ===== */
.faq-item {
  margin-bottom: 8px;
}

.faq-q {
  background: #2a2a2c;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}

.faq-a {
  display: none;
  padding: 8px 12px;
  font-size: 12.5px;
  color: var(--muted);
}

.faq-item.open .faq-a {
  display: block;
}

/* ===== AUTHOR ===== */
.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.author div {
  font-size: 12.5px;
}

.author b {
  display: block;
  color: var(--text);
}

/* ===== FOOTER ===== */
footer {
  text-align: center;
  font-size: 11px;
  opacity: 0.5;
  padding: 12px 0 18px;
}
</style>
</head>

<body>

<header>
  <h1>HorarioTimes</h1>
  <p>Tu horario, claro y automático</p>
</header>

<nav>
  <button class="active" onclick="show('info')">Info</button>
  <button onclick="show('uso')">Uso</button>
  <button onclick="show('faq')">FAQ</button>
  <button onclick="show('autor')">Autor</button>
</nav>

<!-- ===== INFO ===== -->
<section id="info" class="active">
  <div class="card">
    <h2>📲 ¿Qué es?</h2>
    <p>
      HorarioTimes es un widget inteligente que muestra
      tus horarios actualizados sin capturas ni errores.
    </p>
  </div>

  <div class="card image-block">
    <img src="https://dummyimage.com/600x360/1c1c1e/ffffff&text=HorarioTimes+Widget">
    <p>
      Vista clara por turnos, colores y símbolos
      pensados para leer en segundos.
    </p>
  </div>
</section>

<!-- ===== USO ===== -->
<section id="uso">
  <div class="card">
    <h2>⚙️ Cómo usarlo</h2>
    <ol>
      <li>Mantén pulsado el widget</li>
      <li>Toca <b>Editar widget</b></li>
      <li>Introduce tu nombre en <b>Parámetro</b></li>
      <li>Listo ✅</li>
    </ol>
  </div>

  <div class="card">
    <h2>🍔 Iconos</h2>
    <p>
      🍔 Turno largo con comida<br>
      Verde = apertura<br>
      Rojo = cierre
    </p>
  </div>
</section>

<!-- ===== FAQ ===== -->
<section id="faq">
  <div class="card faq-item" onclick="toggleFAQ(this)">
    <div class="faq-q">¿Necesita internet?</div>
    <div class="faq-a">
      Sí, para actualizar datos. Si no hay conexión
      se muestra el último horario guardado.
    </div>
  </div>

  <div class="card faq-item" onclick="toggleFAQ(this)">
    <div class="faq-q">¿Es oficial de Timesburg?</div>
    <div class="faq-a">
      No. Es un desarrollo independiente tipo skin.
    </div>
  </div>

  <div class="card faq-item" onclick="toggleFAQ(this)">
    <div class="faq-q">¿Por qué es de pago?</div>
    <div class="faq-a">
      Mantiene servidores, actualizaciones
      y desarrollo continuo.
    </div>
  </div>
</section>

<!-- ===== AUTOR ===== -->
<section id="autor">
  <div class="card author">
    <img src="https://dummyimage.com/200x200/00cc66/000000&text=4B">
    <div>
      <b>Ali Bhtty</b>
      4Bdev®<br>
      Diseño · Código · UX
    </div>
  </div>
</section>

<footer>
  4Bdev® – 2025<br>
  Unofficial – Timesburg®
</footer>

<script>
function show(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"))
  document.getElementById(id).classList.add("active")

  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"))
  event.target.classList.add("active")
}

function toggleFAQ(el) {
  el.classList.toggle("open")
}
</script>

</body>
</html>
  `

  await web.loadHTML(html)
  await web.present()
}


// ========================================================
// ===================== SECCIONES ========================
// ========================================================
function addSection(widget, title, lista, dia, turno, openers, closers, aperturaColor, cierreColor, textoColor, numRowsGlobal) {
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
  //const numRows = Math.ceil(lista.length / numCols);

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
      numRowsGlobal // esto es lo que renderCard usa para cambiar padding/texto
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

  /* const n = card.addText(trab.nombre);
  n.font = Font.boldSystemFont(fontSize);
  n.textColor = textoColor;
  card.addSpacer(2); */

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
    burger.font = Font.systemFont(fontSize - 2) // 🍔 más pequeña
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
