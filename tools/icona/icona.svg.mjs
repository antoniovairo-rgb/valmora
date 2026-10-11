// Icona di Valmora (PO-048), stile C (D-066): giallo e nero, retino, ombra piatta, «V» con un filo di fumo.
// Disegnata dal codice: `node tools/icona/genera.mjs` produce tutte le misure (Android, web).
// sfondo: true = quadrato pieno (icona classica, web); false = solo il soggetto su trasparente (primo piano adattivo).
export function iconaSvg({ sfondo = true, scala = 1 } = {}) {
  const c = 512, s = 300 * scala; // soggetto centrato; nel primo piano adattivo resta nel cerchio sicuro (66%)
  const retino = sfondo ? `<pattern id="r" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="4.2" fill="#e6be00"/></pattern>
    <rect width="1024" height="1024" fill="#ffd400"/><rect width="1024" height="1024" fill="url(#r)"/>` : '';
  const k = s / 300;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>${sfondo ? '' : ''}</defs>${retino}
  <g transform="translate(${c} ${c}) scale(${k}) translate(-300 -300)">
    <!-- fumo: due volute, magenta e ciano, che salgono dalla V -->
    <path d="M330 150 C 300 100, 380 70, 350 20 C 335 -5, 370 -20, 390 -30" fill="none" stroke="#111" stroke-width="44" stroke-linecap="round"/>
    <path d="M330 150 C 300 100, 380 70, 350 20 C 335 -5, 370 -20, 390 -30" fill="none" stroke="#e0115f" stroke-width="24" stroke-linecap="round"/>
    <path d="M270 160 C 250 120, 300 95, 280 55" fill="none" stroke="#111" stroke-width="34" stroke-linecap="round"/>
    <path d="M270 160 C 250 120, 300 95, 280 55" fill="none" stroke="#00c2ff" stroke-width="16" stroke-linecap="round"/>
    <!-- ombra piatta della V -->
    <path d="M70 170 L210 170 L300 420 L390 170 L530 170 L360 560 L240 560 Z" transform="translate(28 28)" fill="#111"/>
    <!-- V bianca col bordo nero spesso -->
    <path d="M70 170 L210 170 L300 420 L390 170 L530 170 L360 560 L240 560 Z" fill="#fff" stroke="#111" stroke-width="26" stroke-linejoin="miter"/>
    <!-- striscia magenta sulla V, come un timbro -->
    <path d="M140 300 L460 300 L448 340 L152 340 Z" fill="#e0115f" stroke="#111" stroke-width="10"/>
  </g>
</svg>`;
}
