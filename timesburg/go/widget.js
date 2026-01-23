// widget.js
export function renderWidget() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center justify-center p-4 bg-black/50 rounded-[30px]';

  const title = document.createElement('h3');
  title.textContent = 'HorarioTimes.js';
  title.className = 'text-white text-lg font-semibold mb-2';
  container.appendChild(title);

  const info = document.createElement('p');
  info.textContent = 'Nadie tiene mejores horarios que tú.';
  info.className = 'text-white/70 text-xs text-center';
  container.appendChild(info);

  /* const img = document.createElement('img');
  img.src = './assets/icons/ali.png';
  img.className = 'w-16 h-16 rounded-xl mt-2';
  container.appendChild(img); */

  return container;
}