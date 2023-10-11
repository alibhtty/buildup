let modal = document.getElementById("myModal");
let formModal = document.getElementById("formModal");
let acceptBtn = document.getElementById("acceptBtn");
let cancelBtn = document.getElementById("cancelBtn");
let cancelExporBtn = document.getElementById("cancelExporBtn");

//Espero a boton de aceptar presionado
acceptBtn.addEventListener('click', ()=>{
  location.reload();
});


//Espero a boton de cancelar presionado
cancelBtn.addEventListener('click', ()=>{
  modal.style.display = "none";
});

cancelExporBtn.addEventListener('click', (event)=>{
  event.preventDefault()
  formModal.style.display = "none";
  // console.log(event)
  // console.log('cerrado')
});


//Almaceno el boton que va a mostrar el modal
let btn = document.getElementById("resetBtn");

// cuando el usuario presional el boton se muestra el modal
btn.onclick = function() {
  modal.style.display = "block";
}

// cual el usuario presiona en cualquier parte fuera del modal se cierra
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}