function usuarioActivo(usersData) {
  const ahora = new Date();
  const oferta = usersData.configuracion_global?.oferta_free;
  if (oferta?.desde && oferta?.hasta) {
    if (ahora >= new Date(oferta.desde) && ahora <= new Date(oferta.hasta)) return true;
  }
  const clave = args.widgetParameter?.toLowerCase();
  if (!clave) return false;
  const u = usersData.usuarios?.[clave];
  return u?.activo_por_defecto === true;
}