// Add squares
const squares = document.querySelector('.squares');
for (var i = 1; i < 365; i++) {
  const level = Math.floor(Math.random() * 3);  
  squares.insertAdjacentHTML('beforeend', `<li data-level="${level}"></li>`);
}


/* // Obtén la referencia al elemento ul
let ul = document.querySelector('.squares');

// Calcula el número de días en el año (ten en cuenta los años bisiestos)
let year = new Date().getFullYear();
let isLeapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
let daysInYear = isLeapYear ? 366 : 365;

// Crea un li para cada día y añádelo al ul
for (let i = 0; i < daysInYear; i++) {
    let li = document.createElement('li');
    ul.appendChild(li);
} */
