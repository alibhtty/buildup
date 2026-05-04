// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;
// ================================
// CONFIG
// ================================
const FILE_NAME = "planes.json"
const USER_ID = "dani"
const DAYS_AHEAD = 7
const MAX_WIDGET_PLANS = 5

// ================================
// FILE MANAGER / PATHS
// ================================
const fm = FileManager.iCloud()
const basePath = fm.joinPath(fm.documentsDirectory(), "PlanPareja")
const filePath = fm.joinPath(basePath, FILE_NAME)

if (!fm.fileExists(basePath)) {
  fm.createDirectory(basePath)
}


function formatNaturalDate(dateStr) {
  if (!dateStr) return null

  const d = new Date(dateStr)

  const dias = [
    "domingo", "lunes", "martes", "miércoles",
    "jueves", "viernes", "sábado"
  ]

  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ]

  const diaSemana = dias[d.getDay()]
  const dia = d.getDate()
  const mes = meses[d.getMonth()]

  return `${diaSemana} ${dia} de ${mes}`
}



function getMatchPlan(data) {
  const plans = data.planes || []
  const votes = data.votos || {}

  return plans.find(p => {
    const v = votes[p.id]
    if (!v) return false

    const users = Object.values(v)
    return users.length >= 2 && users.every(x => x === true)
  }) || null
}




// ================================
// DATA LAYER
// ================================
function initData() {
  return {
    planes: [],
    votos: {},
    propuestas: []
  }
}

function normalizeDataShape(data) {
  if (!data || typeof data !== "object") {
    return initData()
  }

  if (!Array.isArray(data.planes)) {
    data.planes = []
  }

  if (!data.votos || typeof data.votos !== "object") {
    data.votos = {}
  }

  if (!Array.isArray(data.propuestas)) {
    data.propuestas = []
  }

  return data
}

function safeParseJSON(raw) {
  try {
    const parsed = JSON.parse(raw)
    return normalizeDataShape(parsed)
  } catch (e) {
    // JSON corrupto: reiniciar estructura
    return initData()
  }
}

function ensureFileExists() {
  if (!fm.fileExists(filePath)) {
    const data = initData()
    fm.writeString(filePath, JSON.stringify(data, null, 2))
  }
}

function downloadFromICloudIfNeeded() {
  try {
    if (fm.isFileStoredIniCloud(filePath)) {
      fm.downloadFileFromiCloud(filePath)
    }
  } catch (e) {
    // Ignorar errores de descarga, se manejarán al leer
  }
}

function loadData() {
  ensureFileExists()
  downloadFromICloudIfNeeded()

  let raw = ""
  try {
    raw = fm.readString(filePath)
  } catch (e) {
    // Si falla la lectura, reescribir con datos iniciales
    const data = initData()
    fm.writeString(filePath, JSON.stringify(data, null, 2))
    return data
  }

  if (!raw || typeof raw !== "string") {
    const data = initData()
    fm.writeString(filePath, JSON.stringify(data, null, 2))
    return data
  }

  const data = safeParseJSON(raw)
  // Auto-reparar claves faltantes
  const normalized = normalizeDataShape(data)
  return normalized
}

function saveData(data) {
  const safeData = normalizeDataShape(data)
  fm.writeString(filePath, JSON.stringify(safeData, null, 2))
}

// ================================
// LOGIC LAYER: HELPERS
// ================================
function getPlanById(data, planId) {
  if (!data || !Array.isArray(data.planes)) return null
  return data.planes.find(p => p && p.id === planId) || null
}

function getVotesForPlan(data, planId) {
  if (!data || !data.votos || typeof data.votos !== "object") return {}
  const v = data.votos[planId]
  if (!v || typeof v !== "object") return {}
  return v
}

function getUserVote(data, planId, userId) {
  const v = getVotesForPlan(data, planId)
  if (!v || typeof v !== "object") return null
  if (!(userId in v)) return null
  return v[userId]
}

function getOtherUsersVotes(data, planId, currentUserId) {
  const v = getVotesForPlan(data, planId)
  const result = {}
  for (let key in v) {
    if (!Object.prototype.hasOwnProperty.call(v, key)) continue
    if (key === currentUserId) continue
    result[key] = v[key]
  }
  return result
}

function isPlanMatch(data, planId) {
  const v = getVotesForPlan(data, planId)
  const values = Object.values(v)
  if (values.length < 2) return false
  return values.every(x => x === true)
}

function getPlanStatus(data, plan, currentUserId) {
  const userVote = getUserVote(data, plan.id, currentUserId)
  const others = getOtherUsersVotes(data, plan.id, currentUserId)
  const othersValues = Object.values(others)

  if (isPlanMatch(data, plan.id)) {
    return "match"
  }

  if (userVote === true) {
    return "liked"
  }

  if (userVote === false) {
    return "rejected"
  }

  if (othersValues.some(v => v === true)) {
    return "pending-other-liked"
  }

  return "pending"
}

function getMatches(data) {
  if (!data || !Array.isArray(data.planes)) return []
  return data.planes.filter(p => p && isPlanMatch(data, p.id))
}


// ================================
// LOGIC LAYER: MUTATIONS
// ================================
function addPlan(data, titulo, categoria, duracion = 2, fecha = null, hora = null, ubicacion = null) {
  const safeData = normalizeDataShape(data)
  const id = Date.now()

  const plan = {
    id,
    titulo: String(titulo || "").trim(),
    categoria: String(categoria || "").trim(),
    duracion: Number.isFinite(Number(duracion)) ? Number(duracion) : 2,
    fecha: fecha ? String(fecha) : null,       // ej: "2026-05-10"
    hora: hora ? String(hora) : null,          // ej: "20:00"
    ubicacion: ubicacion ? String(ubicacion) : null,
    createdBy: USER_ID,
    createdAt: new Date().toISOString()
  }

  safeData.planes.push(plan)
  return plan
}

/* function addPlan(data, titulo, categoria, duracion = 2) {
  const safeData = normalizeDataShape(data)
  const id = Date.now()

  const plan = {
    id,
    titulo: String(titulo || "").trim(),
    categoria: String(categoria || "").trim(),
    duracion: Number.isFinite(Number(duracion)) ? Number(duracion) : 2,
    createdBy: USER_ID,
    createdAt: new Date().toISOString()
  }

  safeData.planes.push(plan)
  return plan
}
 */
function votePlan(data, planId, value) {
  const safeData = normalizeDataShape(data)
  if (!safeData.votos[planId]) {
    safeData.votos[planId] = {}
  }
  safeData.votos[planId][USER_ID] = !!value
}

// ================================
// LOGIC LAYER: CALENDAR / PROPOSALS
// (NO SE USA EN EL WIDGET)
// ================================
async function getFreeSlots(daysAhead = 7) {
  const now = new Date()
  const end = new Date()
  end.setDate(now.getDate() + daysAhead)

  const events = await CalendarEvent.between(now, end)

  const busy = events
    .filter(e => e && e.startDate && e.endDate)
    .map(e => ({
      start: e.startDate,
      end: e.endDate
    }))
    .sort((a, b) => a.start - b.start)

  const slots = []
  let current = now

  for (let i = 0; i < busy.length; i++) {
    const b = busy[i]
    if (current < b.start) {
      slots.push({ start: new Date(current), end: new Date(b.start) })
    }
    if (current < b.end) {
      current = b.end
    }
  }

  if (current < end) {
    slots.push({ start: new Date(current), end: new Date(end) })
  }

  return slots
}


// ================================
// UI LAYER: MENU (EJECUCIÓN MANUAL)
// ================================
async function menu(data) {
  const safeData = normalizeDataShape(data)
  const matchPlans = getMatches(safeData)

  const alert = new Alert()
  alert.title = "Plan Pareja"

  alert.addAction("➕ Añadir plan")
  alert.addAction("👍 Votar plan")
  alert.addAction("🗑️ Borrar plan")

  // 👇 SOLO SI HAY MATCH
  if (matchPlans.length > 0) {
    alert.addAction("📅 Guardar en calendario")
  }

  alert.addCancelAction("Cancelar")

  const choice = await alert.present()
  if (choice === -1) return

  // ============================
  // ➕ AÑADIR PLAN (MEJORADO)
  // ============================
  if (choice === 0) {
  
    const a = new Alert()
    a.title = "Nuevo Plan"
    a.message = "Paso a paso"
  
    a.addTextField("Título (ej: Cena, cine)")
    a.addAction("Siguiente")
    a.addCancelAction("Cancelar")
  
    const r1 = await a.present()
    if (r1 !== 0) return
  
    const titulo = a.textFieldValue(0).trim()
    if (!titulo) return
  
  
    // ============================
    // CATEGORÍA
    // ============================
    const categorias = [
      "🍽️ Cena",
      "💻 Virtual",
      "🎬 Cine",
      "🌳 Aire libre",
      "🏠 Casa",
      "🍻 Salida",
      "Sin categoría"
    ]
  
    const c = new Alert()
    c.title = "Categoría"
    categorias.forEach(cat => c.addAction(cat))
    c.addCancelAction("Cancelar")
  
    const r2 = await c.present()
    if (r2 === -1) return
  
    const categoria = categorias[r2]
  
  
    // ============================
    // DURACIÓN
    // ============================
    const dur = new Alert()
    dur.title = "Duración"
  
    const duraciones = [1, 2, 3, 4, 5, 6]
    duraciones.forEach(d => dur.addAction(`${d}h`))
    dur.addCancelAction("Cancelar")
  
    const r3 = await dur.present()
    if (r3 === -1) return
  
    const duracion = duraciones[r3]
  
  
    // ============================
    // FECHA
    // ============================
    const f = new Alert()
    f.title = "Fecha"
  
    f.addAction("Hoy")
    f.addAction("Mañana")
    f.addAction("Elegir día")
    f.addAction("Sin fecha")
    f.addCancelAction("Cancelar")
  
    const r4 = await f.present()
    if (r4 === -1) return
  
    let fecha = null
    const d = new Date()
  
    if (r4 === 0) {
      fecha = d.toISOString().split("T")[0]
    }
  
    if (r4 === 1) {
      d.setDate(d.getDate() + 1)
      fecha = d.toISOString().split("T")[0]
    }
  
    if (r4 === 2) {
      const custom = new Alert()
      custom.title = "Escribe fecha"
      custom.message = "Formato: 2026-05-24"
      custom.addTextField("AAAA-MM-DD")
      custom.addAction("OK")
      custom.addCancelAction("Cancelar")
    
      const rCustom = await custom.present()
      if (rCustom === -1) return
    
      const input = custom.textFieldValue(0).trim()
      fecha = input || null
    }
  
  
    // ============================
    // HORA (10:00 - 22:00)
    // ============================
    const h = new Alert()
    h.title = "Hora"
  
    const horas = []
    for (let i = 10; i <= 22; i++) {
      horas.push(`${i.toString().padStart(2, "0")}:00`)
    }
  
    horas.push("Sin hora")
  
    horas.forEach(x => h.addAction(x))
    h.addCancelAction("Cancelar")
  
    const r5 = await h.present()
    if (r5 === -1) return
  
    const hora = horas[r5] === "Sin hora" ? null : horas[r5]
  
  
    // ============================
    // UBICACIÓN
    // ============================
    const ub = new Alert()
    ub.title = "Ubicación (opcional)"
    ub.addTextField("Ej: centro, playa...")
    ub.addAction("Guardar")
    ub.addCancelAction("Saltar")
  
    const r6 = await ub.present()
  
    const ubicacion = r6 === 0
      ? ub.textFieldValue(0).trim()
      : null
  
  
    // ============================
    // GUARDAR
    // ============================
    addPlan(safeData, titulo, categoria, duracion, fecha, hora, ubicacion)
  }



    // Borrar plan
    if (choice === 2) {  // OJO: este índice puede cambiar si añades más opciones
      if (!safeData.planes || safeData.planes.length === 0) {
        const info = new Alert()
        info.title = "Sin planes"
        info.message = "No hay planes para borrar."
        info.addAction("OK")
        await info.present()
      } else {
        const a = new Alert()
        a.title = "Borrar plan"
        a.message = "Selecciona el plan que quieres eliminar:"
      
        for (let i = 0; i < safeData.planes.length; i++) {
          const p = safeData.planes[i]
          a.addAction(p.titulo || `Plan ${i + 1}`)
        }
        a.addCancelAction("Cancelar")
      
        const index = await a.present()
      
        if (index >= 0 && index < safeData.planes.length) {
          const plan = safeData.planes[index]
        
          // Confirmación
          const confirm = new Alert()
          confirm.title = "Confirmar borrado"
          confirm.message = `¿Seguro que quieres borrar:\n\n"${plan.titulo}"?`
          confirm.addAction("Sí, borrar")
          confirm.addCancelAction("Cancelar")
        
          const res = await confirm.present()
        
          if (res === 0) {
            // 1. Borrar plan
            safeData.planes.splice(index, 1)
          
            // 2. Borrar votos asociados
            if (safeData.votos[plan.id]) {
              delete safeData.votos[plan.id]
            }
          
            // 3. Borrar propuestas asociadas
            safeData.propuestas = safeData.propuestas.filter(p => p.planId !== plan.id)
          
            const done = new Alert()
            done.title = "Plan eliminado"
            done.message = `"${plan.titulo}" ha sido borrado.`
            done.addAction("OK")
            await done.present()
          }
        }
      }
    }


  // Votar plan
  if (choice === 1) {
    if (!safeData.planes || safeData.planes.length === 0) {
      const info = new Alert()
      info.title = "Sin planes"
      info.message = "Crea un plan antes de votar."
      info.addAction("OK")
      await info.present()
    } else {
      const a = new Alert()
      a.title = "Votar plan"
      for (let i = 0; i < safeData.planes.length; i++) {
        const p = safeData.planes[i]
        a.addAction(p.titulo || `Plan ${i + 1}`)
      }
      a.addCancelAction("Cancelar")
      const i = await a.present()

      if (i >= 0 && i < safeData.planes.length) {
        const v = new Alert()
        v.title = "¿Te apetece?"
        v.addAction("👍 Sí")
        v.addAction("👎 No")
        v.addCancelAction("Cancelar")
        const res = await v.present()

        if (res === 0 || res === 1) {
          votePlan(safeData, safeData.planes[i].id, res === 0)
        }
      }
    }
  }


  // ============================
  // 📅 GUARDAR EN CALENDARIO (SELECTOR MATCH)
  // ============================
  const calendarIndex = 3

  if (matchPlans.length > 0 && choice === calendarIndex) {

    const picker = new Alert()
    picker.title = "Selecciona un match"

    matchPlans.forEach(p => {
      picker.addAction(p.titulo)
    })

    picker.addCancelAction("Cancelar")

    const selected = await picker.present()
    if (selected === -1) return

    const plan = matchPlans[selected]

    if (!plan.fecha || !plan.hora) {
      const warn = new Alert()
      warn.title = "Falta fecha u hora"
      warn.addAction("OK")
      await warn.present()
      return
    }

    const start = new Date(`${plan.fecha}T${plan.hora}`)
    const end = new Date(start.getTime() + plan.duracion * 3600000)

    const confirm = new Alert()
    confirm.title = "Añadir al calendario"
    confirm.message = plan.titulo
    confirm.addAction("Confirmar")
    confirm.addCancelAction("Cancelar")

    const res = await confirm.present()

    if (res === 0) {
      const cal = await Calendar.defaultForEvents()
      const event = new CalendarEvent(cal)

      event.title = "❤️ " + plan.titulo
      event.startDate = start
      event.endDate = end

      await event.save()
    }
  }

}



// ================================
// UI LAYER: WIDGET
// ================================
async function createWidget(data) {
  const safeData = normalizeDataShape(data)
  const w = new ListWidget()
  w.setPadding(16, 16, 16, 16)
  w.backgroundColor = Color.dynamic(
    new Color("#EFEFF4"),
    new Color("#1C1C1E")
  )

  // ====== HELPERS ======
  function card(height = null) {
    const stack = w.addStack()
    stack.layoutVertically()
    stack.cornerRadius = 18
    stack.setPadding(16, 16, 16, 16)
    stack.backgroundColor = Color.dynamic(
      new Color("#FFFFFF", 0.22),
      new Color("#2C2C2E", 0.40)
    )
    stack.shadowColor = Color.black()
    stack.shadowOpacity = 0.12
    stack.shadowRadius = 10
    stack.shadowOffset = new Point(0, 4)
    if (height) stack.size = new Size(0, height)
    return stack
  }

  function bigTitle(stack, text) {
    const t = stack.addText(text)
    t.font = Font.boldSystemFont(20)
    t.textColor = Color.dynamic(new Color("#000"), new Color("#FFF"))
  }

  function medium(stack, text) {
    const t = stack.addText(text)
    t.font = Font.mediumSystemFont(14)
    t.textColor = Color.dynamic(new Color("#333"), new Color("#CCC"))
  }

  function small(stack, text, color = null) {
    const t = stack.addText(text)
    t.font = Font.systemFont(12)
    t.textColor = color || Color.dynamic(new Color("#666"), new Color("#AAA"))
  }

  function formatDay(dateStr) {
    const d = new Date(dateStr)
    const opts = { weekday: "long", day: "numeric" }
    return d.toLocaleDateString("es-ES", opts)
  }

  function formatHour(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  function getVoteLabel(vote, name) {
    if (vote === true) return name
    if (vote === false) return `${name} ✕`
    return `falta ${name}`
  }

  function getPlanStatusLabel(votes) {
    const me = votes["ali"]
    const other = votes["dani"]
    if (me === true && other === true) return "MATCH"
    return ""
  }



  // ====== CARD PRINCIPAL: PROPUESTA ACTIVA O MATCH ======
  const matches = getMatches(safeData)
  const mainCard = card()
  
  function capitalize(str) {
    if (!str) return ""
    return str
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  }
  
  function getNextPlan(data) {
    const matches = getMatches(data)
  
    const valid = matches
      .filter(p => p.fecha && p.hora)
      .map(p => ({
        ...p,
        date: new Date(`${p.fecha}T${p.hora}`)
      }))
      .filter(p => !isNaN(p.date))
    
    if (valid.length > 0) {
      valid.sort((a, b) => a.date - b.date)
      return valid[0]
    }
  
    return matches[0] || null
  }
  
  if (matches.length > 0) {
  
    const plan = getNextPlan(safeData)
  
    mainCard.url =
      "scriptable:///run?scriptName=TuScript&action=calendar&planId=" +
      plan.id
  
    // =========================
    // ROW 1: TITLE + HOUR
    // =========================
    const row1 = mainCard.addStack()
    row1.layoutHorizontally()
    row1.centerAlignContent()
  
    const leftTitle = row1.addStack()
    leftTitle.layoutVertically()
  
    const title = leftTitle.addText(capitalize(plan.titulo))
    title.font = Font.boldSystemFont(20)
    title.textColor = Color.white()
  
    row1.addSpacer()
  
    const rightTime = row1.addStack()
    rightTime.layoutVertically()
    rightTime.centerAlignContent()
  
    const hour = rightTime.addText(plan.hora ? plan.hora : "--:--")
    hour.font = Font.boldSystemFont(26)
    hour.textColor = Color.white()
  
    mainCard.addSpacer(8)
  
    // =========================
    // ROW 2: DATE + STATUS + LOCATION
    // =========================
    const row2 = mainCard.addStack()
    row2.layoutHorizontally()
    row2.centerAlignContent()

    // =========================
    // LEFT: FECHA + STATUS
    // =========================
    const leftInfo = row2.addStack()
    leftInfo.layoutVertically()

    const dateText = leftInfo.addText(
      plan.fecha ? formatNaturalDate(plan.fecha) : "Sin fecha"
    )
    dateText.font = Font.mediumSystemFont(13)
    dateText.textColor = new Color("#DDDDDD")

    const status = leftInfo.addText(
      plan.fecha && plan.hora ? "Match confirmado" : "Pendiente"
    )
    status.font = Font.semiboldSystemFont(11)
    status.textColor =
      plan.fecha && plan.hora
        ? new Color("#00C853")
        : new Color("#FFB300")

    // =========================
    // SPACER
    // =========================
    row2.addSpacer()

    // =========================
    // RIGHT: TIME + LOCATION
    // =========================
    const rightInfo = row2.addStack()
    rightInfo.layoutVertically()
    rightInfo.centerAlignContent()

    // ---- TIME LEFT (DD HH MM) ----
    function getTimeLeft(plan) {
      if (!plan.fecha || !plan.hora) return null
    
      const now = new Date()
      const target = new Date(`${plan.fecha}T${plan.hora}`)
      let diff = target - now
    
      if (isNaN(diff)) return null
      if (diff <= 0) return "Ahora"
    
      const minutes = Math.floor(diff / 60000)
      const days = Math.floor(minutes / (60 * 24))
      const hours = Math.floor((minutes % (60 * 24)) / 60)
      const mins = minutes % 60
    
      if (days > 0) {
        return `${days}d ${hours}h`
      }
      if (hours > 0) {
        return `${hours}h ${mins}m`
      }
      return `${mins}m`
    }

    const timeLeft = rightInfo.addText(getTimeLeft(plan) || "")
    timeLeft.font = Font.semiboldSystemFont(12)
    timeLeft.textColor = new Color("#9E9E9E")

    // ---- LOCATION (MISMA COLUMNA DERECHA) ----
    if (plan.ubicacion) {
      const loc = rightInfo.addText(plan.ubicacion)
      loc.font = Font.systemFont(12)
      loc.textColor = new Color("#CCCCCC")
    }
  
  } else {
  
    const empty = mainCard.addText("Sin plan activo")
    empty.font = Font.boldSystemFont(18)
    empty.textColor = Color.white()
  
    mainCard.addSpacer(6)
  
    const sub = mainCard.addText("Cuando haya un match aparecerá aquí")
    sub.font = Font.systemFont(12)
    sub.textColor = new Color("#AAAAAA")
  }
  
  w.addSpacer(14)
  




// SOLO mostrar segunda card en widget grande
if (config.widgetFamily === "large") {

  // ====== CARD SECUNDARIA: PLANES ======
  const card2 = card()
  const title = card2.addText("Planes")
  title.font = Font.boldSystemFont(15)
  title.textColor = Color.dynamic(new Color("#000"), new Color("#FFF"))
  card2.addSpacer(10)

  if (!safeData.planes || safeData.planes.length === 0) {
    small(card2, "Aún no hay planes")
  } else {
    const planesSorted = safeData.planes
      .slice(0)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)

    for (let i = 0; i < planesSorted.length; i++) {
      const p = planesSorted[i]
      const votes = getVotesForPlan(safeData, p.id)
      const me = votes["ali"]
      const other = votes["dani"]

      const row = card2.addStack()
      row.layoutHorizontally()
      row.centerAlignContent()

      // ====== COLUMNA IZQUIERDA ======
      const left = row.addStack()
      left.layoutVertically()

      // Nombre del plan
      const name = left.addText(p.titulo || "Sin título")
      name.font = Font.systemFont(13)
      name.textColor = Color.dynamic(new Color("#111"), new Color("#EEE"))

      // Subinfo: fecha + hora + ubicación
      let subinfo = []
      if (p.fecha) subinfo.push(formatNaturalDate(p.fecha))
      //if (p.fecha) subinfo.push(p.fecha)
      if (p.hora) subinfo.push(p.hora)
      if (p.ubicacion) subinfo.push(p.ubicacion)

      if (subinfo.length > 0) {
        const info = left.addText(subinfo.join(" · "))
        info.font = Font.systemFont(10)
        info.textColor = Color.dynamic(new Color("#444444"), new Color("#AAA"))
      }

      row.addSpacer()

      // ====== COLUMNA DERECHA: ESTADO ======
      const right = row.addStack()
      right.layoutHorizontally()
      right.centerAlignContent()
      right.spacing = 8

      function voteColor(vote) {
        if (vote === true) return new Color("#00C853") // verde
        if (vote === false) return new Color("#D32F2F") // rojo
        return Color.dynamic(new Color("#888"), new Color("#666")) // gris apagado
      }

      function voteText(vote, name) {
        if (vote === true) return name
        if (vote === false) return name
        return name // siempre visible, pero gris
      }

      // MATCH
      if (me === true && other === true) {
        const match = right.addText("MATCH")
        match.font = Font.boldSystemFont(12)
        match.textColor = new Color("#00C853")
      } else {
        const meLabel = right.addText(voteText(me, "ali"))
        meLabel.font = Font.systemFont(11)
        meLabel.textColor = voteColor(me)

        const sep = right.addText("·")
        sep.font = Font.systemFont(11)
        sep.textColor = Color.dynamic(new Color("#AAA"), new Color("#555"))

        const otherLabel = right.addText(voteText(other, "dani"))
        otherLabel.font = Font.systemFont(11)
        otherLabel.textColor = voteColor(other)
      }

      if (i < planesSorted.length - 1) card2.addSpacer(10)
    }
  }
}

  return w
}



// ================================
// MAIN
// ================================
const data = loadData()


const query = args.queryParameters

if (query.action === "calendar" && query.planId) {
  const data = loadData()
  const plan = getPlanById(data, Number(query.planId))

  if (plan && plan.fecha && plan.hora) {
    const start = new Date(`${plan.fecha}T${plan.hora}`)
    const end = new Date(start.getTime() + plan.duracion * 3600000)

    const event = new CalendarEvent()
    event.title = "❤️ " + plan.titulo
    event.startDate = start
    event.endDate = end
    await event.save()
  }

  Script.complete()
  return
}

if (config.runsInWidget) {
  const widget = await createWidget(data)
  Script.setWidget(widget)
  Script.complete()
} else {
  await menu(data)
  saveData(data)
  Script.complete()
}
