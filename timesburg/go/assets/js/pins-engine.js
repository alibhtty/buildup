/* BOTONERA */
document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("pins-layer");
  const title = document.getElementById("pin-title");
  const desc  = document.getElementById("pin-desc");
  const img   = document.getElementById("pin-img");
  const pinInfo = document.getElementById("pin-info");
  const buyInfo = document.getElementById("switcher"); // USAMOS LA BOTONERA
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
    timer = setTimeout(hideInfo, 8000);
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


  let activePin = null; // cache del pin activo

  function loadPins(pinList) {
    layer.textContent = ""; // limpia layer
    const frag = document.createDocumentFragment();
  
    pinList.forEach(p => {
      const el = document.createElement("div");
      el.className = "pin-led";
      el.style.left = p.x + "%";
      el.style.top  = p.y + "%";
      el.dataset.title = p.title;
      el.dataset.desc  = p.desc;
      el.dataset.img   = p.img;
      frag.appendChild(el);
    });
  
    layer.appendChild(frag);
  }

  /* function loadPins(pinList) {
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
  } */

  // --- Click en pin ---
  layer.addEventListener("pointerdown", async e => {
    const pin = e.target.closest(".pin-led");
    if (!pin) return;
  
    if (window.Sound) await Sound.init();
  
    // solo remover active del pin anterior
    if (activePin) activePin.classList.remove("active");
    activePin = pin;
    activePin.classList.add("active");
  
    title.textContent = pin.dataset.title;
    desc.textContent  = pin.dataset.desc;
    img.src           = pin.dataset.img;
  
    Sound.play("click");
  
    showInfo(); // reinicia timer desde último click
  
    if (window.CardEngine?.wobble) CardEngine.wobble();
  });

  // --- Public API ---
  window.PinsEngine = {
    loadPins
  };
});