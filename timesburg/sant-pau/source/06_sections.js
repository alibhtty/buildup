function addSection(widget, title, lista, dia, turno, aperturaColor, cierreColor, textoColor, numRows) {
  const t = widget.addText(title);
  t.font = Font.boldSystemFont(13);
  t.textColor = new Color("#EFDECD");

  const grid = widget.addStack();
  grid.layoutHorizontally();
  grid.spacing = 4;

  const cols = Array.from({length:3},()=> {
    const c = grid.addStack();
    c.layoutVertically();
    c.widthWeight = 1;
    return c;
  });

  lista.forEach((trab,i)=>{
    renderCard(cols[i%3],trab,dia,turno,aperturaColor,cierreColor,textoColor,numRows);
  });
}