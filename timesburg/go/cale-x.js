// Year Progress Wallpaper v25 (Zero-Config: Native Colors & Prefix)

const CONFIG = {
  // --- CONFIGURACIÓN PARA PERSONAS ---
  // El script buscará SOLO los calendarios que empiecen con este símbolo.
  // Simplemente renombra tus calendarios en el iPhone (por ejemplo: "*Vacaciones", "*Turnos").
  // ¡El color se toma de la configuración del propio calendario en iOS!
  calendarPrefix: "*", 

  // Fechas importantes manuales (si no quieres mantener un calendario)
  manualSignificantDates: [], // Ejemplo: ["01-01", "12-31"]
  
  // Prioridad de ordenación:
  // Si los eventos se superponen, ¿cuál se dibuja encima?
  // true = por orden alfabético (1.Holiday cubrirá 2.Work)
  // false = aleatorio (depende del orden que devuelva el sistema)
  sortByName: true,

  // Colores de la interfaz (fondo, texto, días vacíos)
  colors: {
    bg: new Color("#000000"),        
    pastDay: new Color("#ffffff", 0.95), 
    futureDay: new Color("#2c2c2e"),     
    today: new Color("#ff3b30"),
    significant: new Color("#FFD60A"), // Para manualSignificantDates
    text: new Color("#98989d"),          
    highlightText: new Color("#0adeff")   // ff9f0a
  },
  
  // Coeficientes de diseño (Auto-Scale)
  ratios: {
    topPadding: 0.335,  
    spacing: 30.5,      
    radius: 0.3,
    monthGap: 2.1,
    colGap: 1.6 
  }
};

// --- 1. AUTO-DETECCIÓN DE TAMAÑOS ---
const screen = Device.screenSize();
const width = screen.width;
const height = screen.height;

const PADDING_TOP = height * CONFIG.ratios.topPadding;
const DOT_SPACING = width / CONFIG.ratios.spacing;
const DOT_RADIUS = DOT_SPACING * CONFIG.ratios.radius;
const MONTH_GAP = DOT_SPACING * CONFIG.ratios.monthGap;
const COL_GAP = DOT_SPACING * CONFIG.ratios.colGap;

// --- 2. CALENDARIOS DE ESCANEO AUTOMÁTICO---
const date = new Date();
const currentYear = date.getFullYear();

async function fetchAutoCalendars() {
  let calendarsList = [];
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
  
  try {
    const allCalendars = await Calendar.forEvents();
    
    // Filtramos sólo aquellos que empiezan con prefijo (por ejemplo "*")
    let targetCalendars = allCalendars.filter(c => c.title.startsWith(CONFIG.calendarPrefix));
    
    // Ordenar por nombre para controlar la prioridad de la capa
    // (por ejemplo, "1.Fechas" será más importante que "2.Trabajo" si sortByName = true)
    if (CONFIG.sortByName) {
      targetCalendars.sort((a, b) => a.title.localeCompare(b.title));
    }

    for (let cal of targetCalendars) {
      const events = await CalendarEvent.between(startOfYear, endOfYear, [cal]);
      
      calendarsList.push({
        name: cal.title,
        color: cal.color, // ¡TOMAMOS EL COLOR DIRECTAMENTE DESDE IOS!
        events: events.map(e => ({
          start: e.startDate,
          end: e.endDate
        }))
      });
    }
  } catch (e) { console.log("Error: " + e.message); }
  
  return calendarsList;
}

const activeCalendarsData = await fetchAutoCalendars();

// --- 3. DIBUJO ---
const ctx = new DrawContext();
ctx.size = new Size(width, height);
ctx.respectScreenScale = true; 
ctx.opaque = true;
ctx.setFillColor(CONFIG.colors.bg);
ctx.fillRect(new Rect(0, 0, width, height));

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const currentMonth = date.getMonth(); 
const currentDay = date.getDate();

function getDayColor(month, day) {
  const monthStr = (month + 1).toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const dateString = `${monthStr}-${dayStr}`;
  
  const isPast = (month < currentMonth) || (month === currentMonth && day < currentDay);
  const isToday = (month === currentMonth && day === currentDay);
  
  // 1. Prioridad: Hoy
  if (isToday) return CONFIG.colors.today;
  
  // 2. Prioridad: Fechas manuales
  if (CONFIG.manualSignificantDates.includes(dateString)) return CONFIG.colors.significant;
  
  const dayStart = new Date(currentYear, month, day, 0, 0, 0);
  const dayEnd = new Date(currentYear, month, day, 23, 59, 59);

  // 3. Prioridad: Calendarios
  // Revisamos la lista. Como está ordenada, el primer color que encontramos gana.
  for (let calData of activeCalendarsData) {
    for (let event of calData.events) {
      if (event.start <= dayEnd && event.end >= dayStart) {
        return calData.color; // Volvemos al color nativo del calendario.
      }
    }
  }

  // 4. Fondo
  if (isPast) return CONFIG.colors.pastDay;
  return CONFIG.colors.futureDay;
}

const monthBlockWidth = (6 * DOT_SPACING) + (DOT_RADIUS * 2);
const totalCalendarWidth = (3 * monthBlockWidth) + (2 * COL_GAP);
const startX = (width - totalCalendarWidth) / 2;

const fontSizeMonth = width * 0.022; 
const fontSizeStats = width * 0.028; 

for (let m = 0; m < 12; m++) {
  const colIndex = m % 3;
  const rowIndex = Math.floor(m / 3);
  
  const blockX = startX + (colIndex * (monthBlockWidth + COL_GAP));
  const rowHeight = (6 * DOT_SPACING) + (fontSizeMonth * 2) + MONTH_GAP; 
  const blockY = PADDING_TOP + (rowIndex * rowHeight);
  
  ctx.setTextColor(CONFIG.colors.text);
  ctx.setFont(Font.boldSystemFont(fontSizeMonth));
  ctx.setTextAlignedLeft();
  ctx.drawText(monthNames[m], new Point(blockX - (DOT_SPACING * 0.1), blockY - (DOT_SPACING * 1.2)));
  
  const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
  let firstDayWeek = new Date(currentYear, m, 1).getDay();
  let startOffset = (firstDayWeek === 0) ? 6 : firstDayWeek - 1;
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dayIndex = (startOffset + d - 1);
    const gridX = dayIndex % 7;
    const gridY = Math.floor(dayIndex / 7);
    const dotX = blockX + (gridX * DOT_SPACING);
    const dotY = blockY + (gridY * DOT_SPACING);
    
    const fillColor = getDayColor(m, d);
    ctx.setFillColor(fillColor);
    ctx.fillEllipse(new Rect(dotX, dotY, DOT_RADIUS * 2, DOT_RADIUS * 2));
  }
}

// --- STATS ---
const startOfYear = new Date(currentYear, 0, 1);
const endOfYear = new Date(currentYear + 1, 0, 1);
const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
const daysPassed = Math.ceil(Math.abs(date - startOfYear) / (1000 * 60 * 60 * 24)); 
const daysLeft = Math.floor(totalDays - daysPassed);
const percentPassed = Math.floor((daysPassed / totalDays) * 100);

const singleBlockHeight = (6 * DOT_SPACING) + (fontSizeMonth * 2) + MONTH_GAP;
const statsY = PADDING_TOP + (4 * singleBlockHeight) - (MONTH_GAP * 1.5); 
const statsRect = new Rect(0, statsY, width, fontSizeStats * 3);

ctx.setTextAlignedCenter();
ctx.setFont(Font.boldSystemFont(fontSizeStats));
ctx.setTextColor(CONFIG.colors.highlightText);
ctx.drawTextInRect(`${daysLeft} días restantes  •  ${percentPassed}%`, statsRect);

// --- OUTPUT ---
const image = ctx.getImage();
const fm = FileManager.local();
const path = fm.joinPath(fm.temporaryDirectory(), "wallpaper_auto.png");
fm.writeImage(path, image);

Script.setShortcutOutput(path);
Script.complete();