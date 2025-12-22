function avisoPantallaCompleta(widget, icono, mensaje, fondo="#1C1C1E") {
  widget.setPadding(0,0,0,0);
  widget.backgroundColor = new Color(fondo);
  const s = widget.addStack();
  s.layoutVertically();
  s.centerAlignContent();
  s.addSpacer();
  const i = s.addText(icono);
  i.font = Font.boldSystemFont(22);
  i.textColor = Color.white();
  s.addSpacer(6);
  const t = s.addText(mensaje);
  t.font = Font.systemFont(12);
  t.textColor = new Color("#B0B0B0");
  t.centerAlignText();
  s.addSpacer();
  return widget;
}

function avisoSinConexion(w) {
  return avisoPantallaCompleta(w,"(ಠ_ಠ)","Sin conexión a internet","#2A0A0A");
}