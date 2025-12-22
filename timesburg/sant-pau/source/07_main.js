async function crearWidget() {
  const w = new ListWidget();
  const users = await cargarUsuarios();
  if (!usuarioActivo(users)) {
    w.addText("🔒 Premium requerido");
    return w;
  }

  const semanas = await cargarSemanas();
  const fecha = fechaForzada ?? new Date();
  const dia = diasSemana[fecha.getDay()];
  const semana = semanas.find(s => s.id === getWeekNumber(fecha));
  if (!semana) return avisoPantallaCompleta(w,"¯\\_(ツ)_/¯","Sin horarios");

  const md = semana.trabajadores.filter(t=>tieneTurnoValido(t,dia,"mediodia"));
  const n = semana.trabajadores.filter(t=>tieneTurnoValido(t,dia,"noche"));
  const rows = Math.max(Math.ceil(md.length/3),Math.ceil(n.length/3));

  addSection(w,"Mediodía",md,dia,"mediodia",Color.green(),Color.red(),Color.white(),rows);
  addSection(w,"Noche",n,dia,"noche",Color.green(),Color.red(),Color.white(),rows);

  return w;
}