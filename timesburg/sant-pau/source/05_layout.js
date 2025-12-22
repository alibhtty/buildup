function tieneTurnoValido(trab, dia, turno) {
  const t = trab.horarios?.[dia]?.[turno];
  return t && t[0] && t[1];
}