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

  // --- Info-card
  function showInfo() {
    clearTimeout(timer);
    if (!visible) {
      pinInfo.classList.add("show");
      buyInfo.classList.add("show");
      if (window.Sound) Sound.play("appear");
      visible = true;
    }
    timer = setTimeout(hideInfo, 6000);
  }

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
      const btn = document.createElement("button");
      btn.dataset.slide = i;
      btn.textContent = i+1; // opcional, ver qué botón es
      selectorContainer.appendChild(btn);
    });
  }

  // --- Activar slide
  function activate(index) {
    const data = window.CARD_IMAGES[index];
    if (!data) return;

    // Cambiar imagen
    sliderImg.src = data.src;

    // Cargar pins
    loadPins(data.pins);

    // Botones activos
    const buttons = selectorContainer.querySelectorAll("button");
    buttons.forEach(b => b.classList.remove("active"));
    buttons[index]?.classList.add("active");

    // Reset info-card
    if (title) title.textContent = "";
    if (desc) desc.textContent = "";
    if (pinImg) pinImg.src = "";

    if (window.CardEngine?.wobble) CardEngine.wobble();
  }

  // --- Click en botones
  selectorContainer.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const idx = parseInt(btn.dataset.slide, 10);
    activate(idx);
  });

  // --- Init
  createButtons();
  activate(0); // mostrar primera imagen por defecto

});
