// ========================================================
// ========================= MAIN =========================
// ========================================================

// ================= MAIN =================

let usersData

try {
  usersData = await cargarUsuarios()
} catch (e) {
  const w = new ListWidget()
  Script.setWidget(avisoSinConexion(w))
  Script.complete()
  return
}

// sin horarios
if (!usersData?.semanas?.length) {
  const w = new ListWidget()
  Script.setWidget(avisoNoHayHorarios(w, "Actual"))
  Script.complete()
  return
}

// ejecución según contexto
if (config.runsInWidget) {
  const widget = await crearWidget(usersData)
  Script.setWidget(widget)
} else {
  await abrirLandingHorarioTimes()
}

Script.complete()


// ---------- CARGA SEMANAS ----------
/* const semana = obtenerSemanaActual(semanas)

// ---------- SI NO HAY SEMANA ----------
if (!semana) {
  if (!config.runsInWidget) {
    await abrirLandingHorarioTimes()
  }
  Script.complete()
  return
}

// ---------- WIDGET ----------
if (config.runsInWidget) {
  const widget = crearWidgetHorario(semana)
  widget.url = "scriptable:///run?scriptName=WIDGET%20HORARIOTIMES"
  Script.setWidget(widget)
}

// ---------- APP ----------
else {
  await abrirLandingHorarioTimes()
}

Script.complete() */