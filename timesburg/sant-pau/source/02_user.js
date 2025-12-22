let fechaForzada = null;
let usuarioOriginal = null;

(function procesarWidgetParameter() {
  if (!args.widgetParameter) return;
  const p = args.widgetParameter.toLowerCase().split("-");
  if (p.length === 4) {
    const d = new Date(p[3], p[2]-1, p[1]);
    if (!isNaN(d)) {
      fechaForzada = d;
      usuarioOriginal = p[0];
      args.widgetParameter = p[0];
    }
  } else {
    usuarioOriginal = args.widgetParameter;
  }
})();