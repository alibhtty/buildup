const CardEngine = (() => {
  const card  = document.getElementById("card");
  const holo  = document.querySelector(".holo");
  const flare = document.querySelector(".flare");
  const light = document.getElementById("light");

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const state = {
    cx: 0, cy: 0,   // rotación actual
    tx: 0, ty: 0,   // target
    vx: 0, vy: 0,   // velocidad
    dragging: false,
    last: 0
  };

  // --- Drag velocity tracking ---
  let lastPX = 0;
  let lastPY = 0;
  let lastPT = 0;

  // --- Rest detection (battery saver) ---
  const REST_EPSILON = 0.01;
  let resting = false;

  const MAX = 35;

  // ===============================
  // POINTER → TARGET + VELOCITY
  // ===============================
  function pointerTarget(x, y) {
    const r = card.getBoundingClientRect();
    const nx = (x - r.left) / r.width  - 0.5;
    const ny = (y - r.top)  / r.height - 0.5;
  
    state.tx = Math.max(-MAX, Math.min(MAX, nx * 50));
    state.ty = Math.max(-MAX, Math.min(MAX, -ny * 50));
  
    // luz también en hover
    light.style.opacity = 1;
    light.style.background = `
      radial-gradient(
        780px at ${nx * 100 + 50}% ${ny * 100 + 50}%,
        rgba(0,93,56,.48),
        transparent 65%
      )
    `;
  }
  
  function pointerDrag(x, y) {
    pointerTarget(x, y);
  
    const now = performance.now();
    if (lastPT) {
      const dt = now - lastPT;
      if (dt > 0 && dt < 80) {
        const dx = x - lastPX;
        const dy = y - lastPY;
        state.vx += dx * 0.015;
        state.vy += dy * 0.015;
      }
    }
  
    lastPX = x;
    lastPY = y;
    lastPT = now;
  }


  // ===============================
  // IDLE MOTION (FASTER)
  // ===============================
  function idle(t) {
    const k = isIOS ? 22 : 26;
    state.tx = Math.sin(t / 1400) * k;
    state.ty = Math.cos(t / 1600) * k;
  }

  // ===============================
  // PHYSICS UPDATE
  // ===============================
  function update() {
    const spring   = 0.08; // fuerza hacia target
    const friction = 0.72; // inercia / rebote

    state.vx += (state.tx - state.cx) * spring;
    state.vy += (state.ty - state.cy) * spring;

    state.vx *= friction;
    state.vy *= friction;

    state.cx += state.vx;
    state.cy += state.vy;

    // --- Transform ---
    card.style.transform =
      `rotateX(${state.cy}deg) rotateY(${state.cx}deg)`;

    // --- Holo ---
    if (holo) {
      holo.style.backgroundPosition =
        `${50 + state.cx * 1.6}% ${50 + state.cy * 1.6}%`;
    }

    // --- Flare ---
    if (flare) {
      flare.style.backgroundPosition = `
        ${50 + state.cx * 2}% ${50 + state.cy * 2}%,
        ${50 - state.cx * 2.5}% ${50 - state.cy * 2.5}%`;
      flare.style.opacity =
        0.35 + Math.min(Math.abs(state.cx + state.cy) / 90, 0.45);
    }
  }

  // ===============================
  // MAIN LOOP
  // ===============================
  function animate(t) {
    if (isIOS && t - state.last < 32) {
      requestAnimationFrame(animate);
      return;
    }

    state.last = t;

    if (!state.dragging && !document.hidden) {
      idle(t);
    }

    update();

    // --- Rest detection ---
    const speed = Math.abs(state.vx) + Math.abs(state.vy);
    
    if (speed < REST_EPSILON && !state.dragging && !document.hidden) {
      state.vx = 0;
      state.vy = 0;
      resting = true;
      return; // 🧠 duerme el motor
    }
    /* const speed = Math.abs(state.vx) + Math.abs(state.vy);
    if (
      speed < REST_EPSILON &&
      !state.dragging &&
      !document.hidden
    ) {
      resting = true;
      return; // 🧠 duerme el motor
    } */

    requestAnimationFrame(animate);
  }

  // ===============================
  // POINTER EVENTS
  // ===============================
  card.addEventListener("pointerdown", e => {
  if (e.target.classList.contains("pin-led")) return;

  resting = false;
  state.dragging = true;

  // 🔒 ancla inicio REAL
  lastPX = e.clientX;
  lastPY = e.clientY;
  lastPT = performance.now();

  state.vx = 0;
  state.vy = 0;

  card.setPointerCapture(e.pointerId);
  card.classList.add("grabbing");

  requestAnimationFrame(animate);
});


  card.addEventListener("pointermove", e => {
    if (state.dragging) {
      pointerDrag(e.clientX, e.clientY);
    } else if (!isIOS) {
      pointerTarget(e.clientX, e.clientY);
    }
  });
  

  card.addEventListener("pointerup", e => {
    state.dragging = false;
    lastPT = 0;
    card.classList.remove("grabbing");
  
    // 🧯 amortiguación al soltar (CLAVE)
    state.vx *= 0.35;
    state.vy *= 0.35;
  
    if (card.hasPointerCapture(e.pointerId)) {
      card.releasePointerCapture(e.pointerId);
    }
  });
  

  // ===============================
  // PUBLIC API
  // ===============================
  return {
    start() {
      resting = false;
      requestAnimationFrame(animate);
    },

    // ✨ Micro wobble externo (pins)
    wobble() {
      state.vx += (Math.random() - 0.5) * 8;
      state.vy += (Math.random() - 0.5) * 8;
      resting = false;
      requestAnimationFrame(animate);
    }
  };
})();
