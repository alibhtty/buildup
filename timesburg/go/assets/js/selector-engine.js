document.addEventListener("DOMContentLoaded", () => {

  const selectorContainer = document.getElementById("switcher");
  const sliderImg = document.querySelector("#image-slider img");
  const pinsLayer = document.getElementById("pins-layer");

  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const pinImg = document.getElementById("pin-img");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("switcher"); /* buy-info image-selector*/ 

  let visible = false, timer;

    // --- Theme engine (NUEVO)
  function applyTheme(theme) {
    if (!theme) return;

    const r = document.documentElement;

    r.style.setProperty("--c-glass", theme.glass);
    r.style.setProperty("--c-light", theme.light);
    r.style.setProperty("--c-dark", theme.dark);

    r.style.setProperty("--c-content", theme.content);
    r.style.setProperty("--c-action", theme.action);
    r.style.setProperty("--c-bg", theme.bg);

    r.style.setProperty("--glass-reflex-dark", theme.reflexDark);
    r.style.setProperty("--glass-reflex-light", theme.reflexLight);
    r.style.setProperty("--saturation", theme.saturation);
  }

  // --- Info-card
  function showInfo() {
    clearTimeout(timer);           // siempre limpia el timeout anterior
    pinInfo.classList.add("show"); // asegura que esté visible
    buyInfo.classList.add("show"); // idem
  
    // siempre reproducir sonido al mostrar
    if (window.Sound) Sound.play("appear");
  
    visible = true;                // marca como visible
  
    // reinicia el timer
    timer = setTimeout(hideInfo, 6000);
  }
  /* function showInfo() {
    clearTimeout(timer);
    if (!visible) {
      pinInfo.classList.add("show");
      buyInfo.classList.add("show");
      if (window.Sound) Sound.play("appear");
      visible = true;
    }
    timer = setTimeout(hideInfo, 6000);
  } */

  function hideInfo() {
    if (!visible) return;
    pinInfo.classList.remove("show");
    buyInfo.classList.remove("show");
    if (window.Sound) Sound.play("disappear");
    visible = false;
  }

  // --- Pins
  function clearPins() {
    pinsLayer.innerHTML = "";
  }

  function loadPins(pinList) {
    clearPins();
    pinList.forEach(p => {
      const pin = document.createElement("div");
      pin.className = "pin-led";
      pin.style.left = p.x + "%";
      pin.style.top  = p.y + "%";
      pin.dataset.title = p.title;
      pin.dataset.desc  = p.desc;
      pin.dataset.img   = p.img;
      pinsLayer.appendChild(pin);
    });
  }

  // --- Click en pins
  pinsLayer.addEventListener("pointerdown", e => {
    const pin = e.target.closest(".pin-led");
    if (!pin) return;

    document.querySelectorAll(".pin-led").forEach(p => p.classList.remove("active"));
    pin.classList.add("active");

    if (title) title.textContent = pin.dataset.title;
    if (desc)  desc.textContent  = pin.dataset.desc;
    if (pinImg) pinImg.src        = pin.dataset.img;

    if (window.CardEngine) CardEngine.wobble();
    showInfo();
  });

  // --- Crear botones según CARD_IMAGES
function createButtons() {
  if (!window.CARD_IMAGES) return;

  selectorContainer.innerHTML = "";

  window.CARD_IMAGES.forEach((_, i) => {
    const label = document.createElement("label");
    label.className = "switcher__option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "card";              
    input.className = "switcher__input";
    input.dataset.slide = i;
    input.setAttribute("c-option", i + 1);  // para CSS
    if (i === 0) input.checked = true;

    // Aquí agregamos contenido visible
    const span = document.createElement("span");
    span.className = "switcher__icon";
    span.textContent = String.fromCharCode(65 + i); // A, B, C, ... 
    label.appendChild(input);
    label.appendChild(span);

    selectorContainer.appendChild(label);
  });
}

function activate(index) {
  const data = window.CARD_IMAGES[index];
  if (!data) return;

  // aplicar colores del card
  if (data.theme) applyTheme(data.theme);

  // cambiar imagen del slider
  sliderImg.src = data.src;

  // cargar pins del nuevo card
  loadPins(data.pins);

  // limpiar contenido de pin-info
  if (title) title.textContent = "";
  if (desc) desc.textContent = "";
  if (pinImg) pinImg.src = "";

  // ocultar pin-info pero NO buy-info
  pinInfo.classList.remove("show");

  // limpiar pin activo anterior
  document.querySelectorAll(".pin-led").forEach(p => p.classList.remove("active"));

  if (window.CardEngine?.wobble) CardEngine.wobble();
}

  // --- Click en botones
  selectorContainer.addEventListener("change", e => {
  const input = e.target.closest("input.switcher__input");
  if (!input) return;

  const idx = parseInt(input.dataset.slide, 10);
  activate(idx);
});

  // --- Init
  createButtons();
  activate(0);

});
