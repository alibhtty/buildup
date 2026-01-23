// ===============================
// LOADER HELPERS (GLOBAL)
// ===============================
function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  loader.classList.add("hidden");

  // eliminar del DOM tras el fade
  setTimeout(() => {
    loader.remove();
  }, 600);
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// --- Variables de estado ---
let currentX = 0, currentY = 0
let targetX = 0, targetY = 0
let dragging = false
let moved = false

let lastFrame = 0

let ignoreDrag = false
const IGNORE_MS = 35

let idleGlow = 0
let animateId = null

// --- Variables de efectos ---
let holoEnabled = false
let flareEnabled = true

if (isIOS) {
  holoEnabled = false
  flareEnabled = true
}

const card  = document.getElementById("card")
const holo  = document.querySelector(".holo")
const flare = document.querySelector(".flare")
const light = document.getElementById("light")

if (!holoEnabled && holo) holo.style.display = "none"
if (!flareEnabled && flare) flare.style.display = "none"

// --- LERP ---
const lerp = (a, b, n) => a + (b - a) * n

// --- Pointer → Rotación ---
function updateFromPointer(clientX, clientY) {
  idleGlow = 0

  const rect = card.getBoundingClientRect()
  const x = (clientX - rect.left) / rect.width  - 0.5
  const y = (clientY - rect.top)  / rect.height - 0.5

  const MAX_ANGLE = 35
  targetX = Math.max(Math.min(x * 50,  MAX_ANGLE), -MAX_ANGLE)
  targetY = Math.max(Math.min(-y * 50, MAX_ANGLE), -MAX_ANGLE)

  light.style.opacity = 1
  light.style.background = `
    radial-gradient(
      780px at ${x * 100 + 50}% ${y * 100 + 50}%,
      rgba(0,93,56,.48),
      transparent 65%
    )
  `
}

// --- Pointer events ---
let pointerFrame = null

card.addEventListener("pointerdown", e => {
  if (e.target.classList.contains("pin-led")) return

  moved = false
  dragging = true
  ignoreDrag = true

  setTimeout(() => ignoreDrag = false, IGNORE_MS)

  card.setPointerCapture(e.pointerId)
  light.classList.add("light--active")
  card.classList.add("grabbing")
})

card.addEventListener("pointermove", e => {
  if (!dragging && !isIOS) return

  moved = true
  if (pointerFrame) return

  pointerFrame = requestAnimationFrame(() => {
    updateFromPointer(e.clientX, e.clientY)
    pointerFrame = null
  })
})

function release(e) {
  if (!dragging) return; // 🔒 evita dobles releases

  dragging = false;

  // ❌ NO resetear aquí targetX / targetY
  // deja que el lerp vuelva solo

  light.classList.remove("light--active");
  card.classList.remove("grabbing");

  // 🔐 liberar SOLO si estaba capturado
  if (e?.pointerId !== undefined && card.hasPointerCapture(e.pointerId)) {
    card.releasePointerCapture(e.pointerId);
  }
}

/* function release(e) {
  dragging = false

  if (!moved) {
    targetX = 0
    targetY = 0
  }

  light.classList.remove("light--active")
  card.classList.remove("grabbing")

  if (e?.pointerId !== undefined) {
    card.releasePointerCapture(e.pointerId)
  }
} */

card.addEventListener("pointerup", release)
/* card.addEventListener("pointerleave", release) */
card.addEventListener("pointerleave", e => {
  if (dragging) return;
  release(e);
});
card.addEventListener("pointercancel", release)

// --- Animación principal ---
function animate() {
  const now = performance.now()

  // iOS → limitar FPS sin romper movimiento
  if (isIOS && now - lastFrame < 32) {
    animateId = requestAnimationFrame(animate)
    return
  }
  lastFrame = now

  currentX = lerp(currentX, targetX, 0.16)
  currentY = lerp(currentY, targetY, 0.16)

  card.style.transform =
    `rotateX(${currentY}deg) rotateY(${currentX}deg)`

  // --- HOLO ---
  if (holoEnabled && holo) {
    holo.style.backgroundPosition =
      `${50 + currentX * 1.6}% ${50 + currentY * 1.6}%`
  }

  // --- FLARE ---
  if (flareEnabled && flare) {
    flare.style.backgroundPosition = `
      ${50 + currentX * 2}% ${50 + currentY * 2}%,
      ${50 - currentX * 2.5}% ${50 - currentY * 2.5}%`
    flare.style.opacity =
      0.35 + Math.min(Math.abs(currentX + currentY) / 90, 0.45)
  }

  // --- IDLE desktop ---
  //if (!isIOS && !dragging && !document.hidden) {

  // --- Idle (desktop + iOS controlado) ---
    if (!dragging && !document.hidden) {

    const t = now

    /* if (holoEnabled || flareEnabled) {
      targetX = Math.sin(t / 2000) * 18
      targetY = Math.cos(t / 2400) * 18
    } */

    if (isIOS) {
      // iPhone: movimiento MAS suave
      targetX = Math.sin(t / 2600) * 22
      targetY = Math.cos(t / 3000) * 22
    } else if (holoEnabled || flareEnabled) {
      // Desktop: movimiento completo
      targetX = Math.sin(t / 2000) * 24
      targetY = Math.cos(t / 2400) * 24 // 18
    }


    idleGlow = (Math.sin(t / 1800) + 1) * 0.5

    if (flareEnabled) {
      light.style.opacity = 0.35 + idleGlow * 0.25
      light.style.background = `
        radial-gradient(220px at 15% 15%,
          rgba(0,93,56,${0.22 + idleGlow * 0.20}),
          transparent 70%
        ),
        radial-gradient(220px at 85% 85%,
          rgba(0,93,56,${0.18 + idleGlow * 0.15}),
          transparent 75%
        )
      `
    }
  }

  animateId = requestAnimationFrame(animate)
}

// --- Visibilidad ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animateId)
  } else {
    animateId = requestAnimationFrame(animate)
  }
})

// --- INIT ---
//animate()

/* window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    animate();
  });
}); */





















// --- UI SOUND ENGINE ---
let uiAudioCtx = null;
const uiBuffers = {};


// --- LAZY SOUND LOADING (iOS friendly) ---
let soundsLoaded = false;

async function ensureSounds() {
  if (soundsLoaded) return;

  await loadUISound("click", "./assets/icons/clic.wav");
  await loadUISound("appear", "./assets/icons/in.wav");
  await loadUISound("disappear", "./assets/icons/out.wav");

  soundsLoaded = true;
}


async function loadUISound(name, url) {
  if (!uiAudioCtx) uiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await uiAudioCtx.decodeAudioData(arrayBuffer);
  uiBuffers[name] = audioBuffer;
}

function playUISound(name, volume = 0.15) {
  if (!uiAudioCtx) uiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (uiAudioCtx.state === 'suspended') uiAudioCtx.resume();

  const buffer = uiBuffers[name];
  if (!buffer) return;

  const gain = uiAudioCtx.createGain();
  gain.gain.value = volume;

  const source = uiAudioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain).connect(uiAudioCtx.destination);
  source.start();
}

// --- ESPERAR CARGA DEL DOM y SONIDOS ---
/* document.addEventListener("DOMContentLoaded", async () => {

  // 1️⃣ Cargar todos los sonidos antes de usar
  await loadUISound("click", "./assets/icons/tictac.wav");
  await loadUISound("appear", "./assets/icons/in.wav");
  await loadUISound("disappear", "./assets/icons/in.wav"); */

  document.addEventListener("DOMContentLoaded", () => {

  const layer = document.getElementById("pins-layer");
  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("buy-info");


  // --- ESTADO GLOBAL (ANTI MULTI-OUT) ---
let infoVisible = false;
let isHiding = false;

// --- TIMEOUTS ---
let pinShowTimeout = null;
let pinHideTimeout = null;
let buyShowTimeout = null;
let buyHideTimeout = null;

function clearAllTimeouts() {
  clearTimeout(pinShowTimeout);
  clearTimeout(pinHideTimeout);
  clearTimeout(buyShowTimeout);
  clearTimeout(buyHideTimeout);
}

  // --- SONIDOS ---
  /* const clickSound = new Audio('./assets/icons/tictac.wav');
  clickSound.volume = 0.15;
  clickSound.preload = 'auto';

  const appearSound = new Audio('./assets/icons/in.wav'); 
  appearSound.volume = 0.15;
  appearSound.preload = 'auto';

  const disappearSound = new Audio('./assets/icons/in.wav');
  disappearSound.volume = 0.15;
  disappearSound.preload = 'auto'; */

  // --- PINS ---
  /* const pins = [
    { x:0.225, y:0.132, title:"Turnos Mediodía", desc:"Bloque con miembros para el turno mediodia, Rango de 10:30 a 17:00", img:"./info/cpu.jpg" },
    { x:0.176, y:0.412, title:"Turnos de Noche", desc:"Bloque con miembros para el turno noche, Rango de 19:00 a 01:00", img:"./info/io.jpg" },
    { x:0.960, y:0.060, title:"Nombre de Local", desc:"Tu sede fija y equipo con el que compartes horarios.", img:"./info/cpu.jpg" },
    { x:0.366, y:0.056, title:"Día y Semana actual", desc:"Renderizado del día actual junto con todos los datos del widget.", img:"./info/ram.jpg" },
    { x:0.80, y:0.192, title:"Comidas", desc:"Comida de fin de franja para los miebros asignados según cálculo de horas.", img:"./info/power.jpg" },
    { x:0.055, y:0.712, title:"Turnos de Apertura y Cierre", desc:"Los pilares del turno, los miembros que abren y cierran el turno indicado con colores. ", img:"./info/io.jpg" },
    { x:0.568, y:0.71, title:"Estado de cuenta PRO", desc:"Las lineas de color azúl representan 2 días con PRO, las lineas grises son días vacíos. Todo el stack representa 1mes de PRO", img:"./info/io.jpg" },
    { x:0.085, y:0.79, title:"Apartado exclusivo para usuario PRO", desc:"Horario semanal del usuario, con franjas y días libres señalados. El día actual siempre se marca de color oscuro.", img:"./info/io.jpg" },
    { x:0.908, y:0.78, title:"Contador de tiempo restante", desc:"Dos tipos de contadores pasa saber en cuanto tiempo exacto entras o sales del turno según el contexto. Los contadores funcionan en distintos tamaños del widget para los usuario PRO.", img:"./info/io.jpg" }
  ]; */
  // --- PINS POR SLIDE ---
const slidesPins = [
  [ // Slide 0
    { x:0.225, y:0.132, title:"Turnos Mediodía", desc:"Bloque con miembros para el turno mediodia, Rango de 10:30 a 17:00", img:"./info/cpu.jpg" },
    { x:0.176, y:0.412, title:"Turnos de Noche", desc:"Bloque con miembros para el turno noche, Rango de 19:00 a 01:00", img:"./info/io.jpg" },
    { x:0.960, y:0.060, title:"Nombre de Local", desc:"Tu sede fija y equipo con el que compartes horarios.", img:"./info/cpu.jpg" },
    { x:0.366, y:0.056, title:"Día y Semana actual", desc:"Renderizado del día actual junto con todos los datos del widget.", img:"./info/ram.jpg" },
    { x:0.80, y:0.192, title:"Comidas", desc:"Comida de fin de franja para los miebros asignados según cálculo de horas.", img:"./info/power.jpg" },
    { x:0.055, y:0.712, title:"Turnos de Apertura y Cierre", desc:"Los pilares del turno, los miembros que abren y cierran el turno indicado con colores. ", img:"./info/io.jpg" },
    { x:0.568, y:0.71, title:"Estado de cuenta PRO", desc:"Las lineas de color azúl representan 2 días con PRO, las lineas grises son días vacíos. Todo el stack representa 1mes de PRO", img:"./info/io.jpg" },
    { x:0.085, y:0.79, title:"Apartado exclusivo para usuario PRO", desc:"Horario semanal del usuario, con franjas y días libres señalados. El día actual siempre se marca de color oscuro.", img:"./info/io.jpg" },
    { x:0.908, y:0.78, title:"Contador de tiempo restante", desc:"Dos tipos de contadores pasa saber en cuanto tiempo exacto entras o sales del turno según el contexto. Los contadores funcionan en distintos tamaños del widget para los usuario PRO.", img:"./info/io.jpg" }
  ],
  [ // Slide 1
    /* { x:0.296, y:0.260, title:"Nombre de Local", desc:"Sede fija y equipo", img:"./info/cpu.jpg" }, */
    { x:0.66, y:0.55, title:"Día y Semana actual", desc:"Renderizado del día actual", img:"./info/ram.jpg" }
  ],
  [ // Slide 2
    { x:0.225, y:0.185, title:"Turnos Mediodía", desc:"Bloque con miembros para el turno mediodia, Rango de 10:30 a 17:00", img:"./info/cpu.jpg" },
    { x:0.176, y:0.465, title:"Turnos de Noche", desc:"Bloque con miembros para el turno noche, Rango de 19:00 a 01:00", img:"./info/io.jpg" },
    { x:0.960, y:0.115, title:"Nombre de Local", desc:"Tu sede fija y equipo con el que compartes horarios.", img:"./info/cpu.jpg" },
    { x:0.306, y:0.11, title:"Día y Semana actual", desc:"Renderizado del día actual junto con todos los datos del widget.", img:"./info/ram.jpg" },
    { x:0.592, y:0.246, title:"Comidas", desc:"Comida de fin de franja para los miebros asignados según cálculo de horas.", img:"./info/power.jpg" },
    { x:0.055, y:0.652, title:"Turnos de Apertura y Cierre", desc:"Los pilares del turno, los miembros que abren y cierran el turno indicado con colores. ", img:"./info/io.jpg" },
    { x:0.568, y:0.652, title:"Estado de cuenta PRO", desc:"Las lineas de color azúl representan 2 días con PRO, las lineas grises son días vacíos. Todo el stack representa 1mes de PRO", img:"./info/io.jpg" },
    { x:0.08, y:0.752, title:"Apartado exclusivo para usuario PRO", desc:"Horario semanal del usuario, con franjas y días libres señalados. El día actual siempre se marca de color oscuro.", img:"./info/io.jpg" },
    { x:0.908, y:0.722, title:"Contador de tiempo restante", desc:"Dos tipos de contadores pasa saber en cuanto tiempo exacto entras o sales del turno según el contexto. Los contadores funcionan en distintos tamaños del widget para los usuario PRO.", img:"./info/io.jpg" }
  ]
];

  // --- FLAGS PARA SONIDO ---
  /* let pinSoundPlayed = false;
  let buySoundPlayed = false; */

  // --- TIMEOUTS ---
 /*  let pinShowTimeout = null;
  let pinHideTimeout = null;
  let buyShowTimeout = null;
  let buyHideTimeout = null; */

  function showPinInfo() {
  clearAllTimeouts();
  isHiding = false;

  if (!infoVisible) {
    pinShowTimeout = setTimeout(() => {
      pinInfo.classList.add("show");
      playUISound("appear");
      infoVisible = true;
    }, 800);

    buyShowTimeout = setTimeout(() => {
      buyInfo.classList.add("show");
    }, 1200);
  }

  pinHideTimeout = setTimeout(hidePinInfo, 9000);
}

  function hidePinInfo() {
  if (!infoVisible || isHiding) return;

  isHiding = true;
  clearAllTimeouts();

  pinInfo.classList.remove("show");
  buyInfo.classList.remove("show");

  playUISound("disappear");

  infoVisible = false;

  setTimeout(() => {
    isHiding = false;
  }, 400); // duración del fade
}

  // --- CREAR PINS ---
  /* pins.forEach(pin => {
    const el = document.createElement("div");
    el.className = "pin-led";
    el.style.left = (pin.x*100) + "%";
    el.style.top  = (pin.y*100) + "%";

    el.addEventListener("pointerdown", async e => {
      e.preventDefault();
      e.stopPropagation();
    
      await ensureSounds();
    
      document.querySelectorAll('.pin-led').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
    
      playUISound("click");
    
      title.textContent = pin.title;
      desc.textContent = pin.desc;
      document.getElementById("pin-img").src = pin.img;
    
      showPinInfo();
    });

    layer.appendChild(el);
  }); */

  const slideContainers = document.querySelectorAll('#image-slider .slide-container');

  slideContainers.forEach((slide, index) => {
    const layer = slide.querySelector('.pins-layer');
  
    slidesPins[index].forEach(pin => {
      const el = document.createElement("div");
      el.className = "pin-led";
      el.style.left = (pin.x * 100) + "%";
      el.style.top  = (pin.y * 100) + "%";
  
      el.addEventListener("pointerdown", async e => {
        e.preventDefault();
        e.stopPropagation();
        
        await ensureSounds();
  
        // Desactiva pins de esta slide
        layer.querySelectorAll('.pin-led').forEach(p => p.classList.remove('active'));
        el.classList.add('active');
  
        playUISound("click");
  
        title.textContent = pin.title;
        desc.textContent = pin.desc;
        document.getElementById("pin-img").src = pin.img;
  
        showPinInfo();
      });
  
      layer.appendChild(el);
    });
  });

  // --- SLIDES AUTOMÁTICAS ---
  const slides = document.querySelectorAll('#image-slider .slide-container');
  let current = 0;
  
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.querySelector('img').classList.remove('active');
      slide.querySelector('.pins-layer').style.opacity = '0'; // oculta pins
      if (i === index) {
        slide.querySelector('img').classList.add('active');
        slide.querySelector('.pins-layer').style.opacity = '1'; // muestra pins
      }
    });
  }
  
  // Mostrar la primera slide
  showSlide(current);
  
  // Cambiar slide cada 8s
  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 8000);

  // --- Aquí pones el efecto touch para móviles ---
  document.querySelectorAll('.pin-led').forEach(pin => {

    // --- TOUCH (móvil) ---
    pin.addEventListener('touchstart', e => {
      e.preventDefault();
      pin.classList.add('active');
    }, { passive: false });
  
    pin.addEventListener('touchend', () => {
      pin.classList.remove('active');
    });
  
    pin.addEventListener('touchcancel', () => {
      pin.classList.remove('active');
    });
  
    // --- POINTER fallback ---
    pin.addEventListener('pointerdown', () => {
      pin.classList.add('active');
    });
  
    pin.addEventListener('pointerup', () => {
      pin.classList.remove('active');
    });
  
    pin.addEventListener('pointerleave', () => {
      pin.classList.remove('active');
    });
  
  });

});


/* window.addEventListener("load", () => {
  document.documentElement.classList.remove('loading');
  document.documentElement.classList.add('ready');
}); */


window.addEventListener("load", () => {
  // 1️⃣ Marca la página como lista
  document.documentElement.classList.remove('loading');
  document.documentElement.classList.add('ready');

  // 2️⃣ Inicia animación 3D
  requestAnimationFrame(() => {
    animate();
  });

  // 3️⃣ Oculta el loader con fade out
  setTimeout(hideLoader, 500); // coincide con tu transición CSS
});