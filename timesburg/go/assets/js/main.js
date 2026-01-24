/* window.addEventListener("load", () => {
  document.documentElement.classList.replace("loading", "ready");

  CardEngine.start();
  setTimeout(hideLoader, 500);
});
 */
window.addEventListener("load", () => {
  document.documentElement.classList.replace("loading", "ready");

  CardEngine.start();

  // Si no tienes loader, puedes quitar esto o hacer función vacía:
  // setTimeout(hideLoader, 500);

  // --- Función de placeholder para evitar error
  function hideLoader() { /* opcional: si quieres ocultar un loader */ }
  setTimeout(hideLoader, 500);
});




// --- Datos globales de imágenes y pins ---
/* const CARD_IMAGES = [
  {
    src: "./assets/img/cover00.jpg",
    pins: [
      { x:22.5, y:13.2, title:"Turnos Mediodía", desc:"Bloque con miembros para el turno mediodia, Rango de 10:30 a 17:00", img:"./info/cpu.jpg" },
      { x:17.6, y:41.2, title:"Turnos de Noche", desc:"Bloque con miembros para el turno noche, Rango de 19:00 a 01:00", img:"./info/io.jpg" },
      { x:96.0, y:6.0, title:"Nombre de Local", desc:"Tu sede fija y equipo con el que compartes horarios.", img:"./info/cpu.jpg" },
      { x:36.6, y:5.6, title:"Día y Semana actual", desc:"Renderizado del día actual junto con todos los datos del widget.", img:"./info/ram.jpg" },
      { x:80.0, y:19.2, title:"Comidas", desc:"Comida de fin de franja para los miebros asignados según cálculo de horas.", img:"./info/power.jpg" },
      { x:5.5, y:71.2, title:"Turnos de Apertura y Cierre", desc:"Los pilares del turno, los miembros que abren y cierran el turno indicado con colores. ", img:"./info/io.jpg" },
      { x:56.8, y:71.0, title:"Estado de cuenta PRO", desc:"Las lineas de color azúl representan 2 días con PRO, las lineas grises son días vacíos. Todo el stack representa 1mes de PRO", img:"./info/io.jpg" },
      { x:8.5, y:79.0, title:"Apartado exclusivo para usuario PRO", desc:"Horario semanal del usuario, con franjas y días libres señalados. El día actual siempre se marca de color oscuro.", img:"./info/io.jpg" },
      { x:90.8, y:78.0, title:"Contador de tiempo restante", desc:"Dos tipos de contadores pasa saber en cuanto tiempo exacto entras o sales del turno según el contexto. Los contadores funcionan en distintos tamaños del widget para los usuario PRO.", img:"./info/io.jpg" }
    ]
  },
  {
    src: "./assets/img/cover01.jpg",
    pins: [
      { x: 17.6, y: 41.2, title: "Turnos de Noche", desc: "Turno noche...", img: "./info/io.jpg" },
      { x: 56.8, y: 71, title: "Estado PRO", desc: "Stack 1 mes PRO...", img: "./info/io.jpg" }
    ]
  },
  {
    src: "./assets/img/cover02.jpg",
    pins: [
      { x: 9.5, y: 7, title: "Nombre de Local", desc: "Sede fija...", img: "./info/cpu.jpg" },
      { x: 5.5, y: 71.2, title: "Turnos Apertura/Cierre", desc: "Pilares del turno...", img: "./info/io.jpg" }
    ]
  },
  {
    src: "./assets/img/cover03.jpg",
    pins: [
      { x: 20, y: 30, title: "Pin Extra 1", desc: "Imagen 4", img: "./info/io.jpg" }
    ]
  },
  {
    src: "./assets/img/cover04.jpg",
    pins: [
      { x: 70, y: 55, title: "Pin Extra 2", desc: "Imagen 5", img: "./info/io.jpg" }
    ]
  }
];
 */