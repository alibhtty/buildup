/* BOTONERA */
document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("pins-layer");
  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const img   = document.getElementById("pin-img");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("image-selector"); // USAMOS LA BOTONERA
  let visible = false, timer;

  // --- Mostrar info escalado ---
  function showInfo() {
    clearTimeout(timer);
    if (visible) return;
    visible = true;

    // Pin-info aparece primero
    setTimeout(() => {
      pinInfo.classList.add("show");
      Sound.play("appear");
    }, 650);

    // Botonera aparece después
    setTimeout(() => {
      buyInfo.classList.add("show");
      Sound.play("appear");
    }, 940);

    // Ocultar todo después de 6 segundos
    timer = setTimeout(hideInfo, 6000);
  }

  function hideInfo() {
    if (!visible) return;
    pinInfo.classList.remove("show");
    buyInfo.classList.remove("show");
    Sound.play("disappear");
    visible = false;
  }

  // --- Pins ---
  function clearPins() {
    layer.innerHTML = "";
  }

  function loadPins(pinList) {
    clearPins();
    pinList.forEach(p => {
      const el = document.createElement("div");
      el.className = "pin-led";
      el.style.left = p.x + "%";
      el.style.top  = p.y + "%";
      el.dataset.title = p.title;
      el.dataset.desc  = p.desc;
      el.dataset.img   = p.img;
      layer.appendChild(el);
    });
  }

  // --- Click en pin ---
  layer.addEventListener("pointerdown", async e => {
    const pin = e.target.closest(".pin-led");
    if (!pin) return;

    if (window.Sound) await Sound.init();

    document.querySelectorAll(".pin-led").forEach(p => p.classList.remove("active"));
    pin.classList.add("active");

    title.textContent = pin.dataset.title;
    desc.textContent  = pin.dataset.desc;
    img.src           = pin.dataset.img;

    Sound.play("click");

    showInfo();

    if (window.CardEngine?.wobble) CardEngine.wobble();
  });

  // --- Public API ---
  window.PinsEngine = {
    loadPins
  };
});




/* document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("pins-layer");
  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const img   = document.getElementById("pin-img");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("buy-info");

  let visible = false, timer;

  // --- Mostrar info escalado ---
  function showInfo() {
    clearTimeout(timer);
    if (visible) return;
    visible = true;

    // Pin-info aparece primero
    setTimeout(() => {
      pinInfo.classList.add("show");
      Sound.play("appear"); // sonido de entrada
    }, 650);

    // Buy-info aparece después
    setTimeout(() => {
      buyInfo.classList.add("show");
      Sound.play("appear"); // mismo sonido de entrada
    }, 850);

    // Ocultar todo después de 6 segundos
    timer = setTimeout(hideInfo, 6000);
  }

  function hideInfo() {
    if (!visible) return;
    pinInfo.classList.remove("show");
    buyInfo.classList.remove("show");
    Sound.play("disappear"); // sonido de salida
    visible = false;
  }

  // --- Pins ---
  function clearPins() {
    layer.innerHTML = "";
  }

  function loadPins(pinList) {
    clearPins();
    pinList.forEach(p => {
      const el = document.createElement("div");
      el.className = "pin-led";
      el.style.left = p.x + "%";
      el.style.top  = p.y + "%";
      el.dataset.title = p.title;
      el.dataset.desc  = p.desc;
      el.dataset.img   = p.img;
      layer.appendChild(el);
    });
  }

  // --- Click en pin ---
  layer.addEventListener("pointerdown", async e => {
    const pin = e.target.closest(".pin-led");
    if (!pin) return;

    // Inicializar sonido al primer click
    if (window.Sound) await Sound.init();

    // Activar LED
    document.querySelectorAll(".pin-led").forEach(p => p.classList.remove("active"));
    pin.classList.add("active");

    // Actualizar info
    title.textContent = pin.dataset.title;
    desc.textContent  = pin.dataset.desc;
    img.src           = pin.dataset.img;

    // Sonido de click en LED
    Sound.play("click");

    // Mostrar info escalado
    showInfo();

    // Card wobble
    if (window.CardEngine?.wobble) CardEngine.wobble();
  });

  // --- Public API ---
  window.PinsEngine = {
    loadPins
  };
}); */




/* document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("pins-layer");
  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const img   = document.getElementById("pin-img");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("buy-info");

  let visible = false, timer;

  function show() {
    clearTimeout(timer);
    if (!visible) {
      pinInfo.classList.add("show");
      buyInfo.classList.add("show");
      Sound.play("appear");
      visible = true;
    }
    timer = setTimeout(hide, 6000);
  }

  function hide() {
    if (!visible) return;
    pinInfo.classList.remove("show");
    buyInfo.classList.remove("show");
    Sound.play("disappear");
    visible = false;
  }

  function clearPins() {
    layer.innerHTML = "";
  }

  function loadPins(pinList) {
    clearPins();
    pinList.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "pin-led";
      el.style.left = p.x + "%";
      el.style.top  = p.y + "%";
      el.dataset.title = p.title;
      el.dataset.desc  = p.desc;
      el.dataset.img   = p.img;
      layer.appendChild(el);
    });
  }

  // --- Click en pin ---
  layer.addEventListener("pointerdown", async e => {
    const pin = e.target.closest(".pin-led");
    if (!pin) return;

    await Sound.init();
    document.querySelectorAll(".pin-led").forEach(p => p.classList.remove("active"));
    pin.classList.add("active");

    title.textContent = pin.dataset.title;
    desc.textContent  = pin.dataset.desc;
    img.src           = pin.dataset.img;

    Sound.play("click");
    show();

    if (window.CardEngine) {
      CardEngine.wobble();
    }
  });

  // --- Public API ---
  window.PinsEngine = {
    loadPins
  };
}); */
