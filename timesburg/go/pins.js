const card = document.getElementById("card")
const pinsLayer = document.getElementById("pins-layer")

const infoBox = document.getElementById("pin-info")
const infoTitle = document.getElementById("pin-title")
const infoDesc = document.getElementById("pin-desc")

const PINS = [
  {
    id: "cpu",
    x: 0.25,
    y: 0.3,
    title: "CPU Widget",
    desc: "Procesador principal del widget."
  },
  {
    id: "ram",
    x: 0.65,
    y: 0.4,
    title: "RAM Module",
    desc: "Memoria dinámica y estados."
  },
  {
    id: "power",
    x: 0.5,
    y: 0.78,
    title: "Power LED",
    desc: "Indicador de encendido."
  }
]

function pinPos(pin) {
  const r = card.getBoundingClientRect()
  return {
    x: r.left + pin.x * r.width,
    y: r.top + pin.y * r.height
  }
}

function placeInfoPanel() {
  const portrait = window.innerHeight > window.innerWidth

  if (portrait) {
    infoBox.style.top = "16px"
    infoBox.style.left = "50%"
    infoBox.style.right = "auto"
    infoBox.style.transform = "translateX(-50%)"
  } else {
    infoBox.style.top = "50%"
    infoBox.style.right = "24px"
    infoBox.style.left = "auto"
    infoBox.style.transform = "translateY(-50%)"
  }
}

PINS.forEach(pin => {
  const el = document.createElement("div")
  el.className = "pin-led"
  pinsLayer.appendChild(el)

  function update() {
    const p = pinPos(pin)
    el.style.left = `${p.x}px`
    el.style.top = `${p.y}px`
  }

  update()
  window.addEventListener("resize", update)
  window.addEventListener("scroll", update)

  el.addEventListener("click", e => {
    e.stopPropagation()

    document.querySelectorAll(".pin-led")
      .forEach(p => p.classList.remove("active"))

    el.classList.add("active")

    infoTitle.textContent = pin.title
    infoDesc.textContent = pin.desc

    placeInfoPanel()
    infoBox.style.opacity = 1
    infoBox.style.pointerEvents = "auto"
  })
})

window.addEventListener("click", () => {
  infoBox.style.opacity = 0
  infoBox.style.pointerEvents = "none"
  document.querySelectorAll(".pin-led")
    .forEach(p => p.classList.remove("active"))
})
