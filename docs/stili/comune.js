// Contenuto condiviso delle tre bozze: stessa scena (ondata 1, chiamata 1 di 5).
window.SCENA = {
  settori: [
    { id: 'cc', nome: 'Curva Cinderwick', x: 22, y: 42, t: 0.55 },
    { id: 'cl', nome: 'Curva Larkspire', x: 78, y: 42, t: 0.2 },
    { id: 'pz', nome: 'Piazzale', x: 50, y: 74, t: 0.35 },
    { id: 'sc', nome: 'Strada da Cinderwick', x: 12, y: 88, t: 0.85, attiva: true },
    { id: 'sl', nome: 'Strada da Larkspire', x: 88, y: 88, t: 0.1 },
  ],
  unita: { cc: ['S4', 'M1'], pz: ['S2'], sc: ['Q3'], sl: ['Q1'] },
};
// Mappa condivisa, parametrica sulla palette: p = { sfondo, griglia, blocchi, strada, stradaAttiva, stadio, bordoStadio, prato, righe, caldo:[freddo,medio,caldo], anello, testo, ombraTesto, badgeBg, badgeTesto, badgeBordo }
window.mappa = (el, p, H = 270) => {
  const W = 360, col = (t) => (t < 0.3 ? p.caldo[0] : t < 0.6 ? p.caldo[1] : p.caldo[2]);
  const pos = (x) => ({ cx: Math.min(330, Math.max(30, (x.x / 100) * W)), cy: (x.y / 100) * H });
  let s = `<svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%"><defs>
  <pattern id="gr" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="${p.griglia}"/></pattern>
  <linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.stadio[0]}"/><stop offset="1" stop-color="${p.stadio[1]}"/></linearGradient>
  ${SCENA.settori.map((x) => `<radialGradient id="h${x.id}"><stop offset="0" stop-color="${col(x.t)}" stop-opacity=".7"/><stop offset="1" stop-color="${col(x.t)}" stop-opacity="0"/></radialGradient>`).join('')}
  </defs><rect width="${W}" height="${H}" fill="${p.sfondo}"/><rect width="${W}" height="${H}" fill="url(#gr)"/>
  ${[[10,10,60,40],[80,6,50,30],[250,8,70,36],[300,60,50,50],[8,60,40,60],[150,215,60,40],[230,200,40,50],[90,200,40,30]].map(([x,y,w,h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${p.blocchi}"/>`).join('')}
  <path d="M40 ${H} C 60 200, 110 170, 150 150" stroke="${p.stradaAttiva}" stroke-opacity=".35" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M320 ${H} C 300 200, 250 170, 210 150" stroke="${p.strada}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M40 ${H} C 60 200, 110 170, 150 150" stroke="${p.stradaAttiva}" stroke-width="3" fill="none" stroke-dasharray="5 7"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite"/></path>
  <ellipse cx="180" cy="116" rx="98" ry="60" fill="${p.ombraStadio ?? 'rgba(0,0,0,.35)'}" transform="translate(0 8)"/>
  <ellipse cx="180" cy="112" rx="98" ry="60" fill="url(#st)" stroke="${p.bordoStadio}" stroke-width="2"/>
  <ellipse cx="180" cy="112" rx="80" ry="45" fill="none" stroke="${p.anello}" stroke-width="12"/>
  <rect x="134" y="88" width="92" height="48" rx="4" fill="${p.prato}" stroke="${p.righe}" stroke-width="1.5"/>
  <line x1="180" y1="88" x2="180" y2="136" stroke="${p.righe}" stroke-width="1.5"/><circle cx="180" cy="112" r="9" fill="none" stroke="${p.righe}" stroke-width="1.5"/>
  ${SCENA.settori.map((x) => { const { cx, cy } = pos(x); return `<circle cx="${cx}" cy="${cy}" r="40" fill="url(#h${x.id})"/>
  ${x.attiva ? `<circle cx="${cx}" cy="${cy}" r="16" fill="none" stroke="${p.stradaAttiva}" stroke-width="3"><animate attributeName="r" from="14" to="34" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="1.4s" repeatCount="indefinite"/></circle>` : ''}
  <circle cx="${cx}" cy="${cy}" r="13" fill="${col(x.t)}" stroke="${p.bordoPin ?? '#fff'}" stroke-width="3"/>`; }).join('')}</svg>`;
  SCENA.settori.forEach((x) => { const { cx, cy } = pos(x);
    s += `<div style="position:absolute;left:${cx / W * 100}%;top:${cy / H * 100}%;transform:translate(-50%,18px);font:${p.font};color:${p.testo};text-shadow:${p.ombraTesto};white-space:nowrap;text-align:center">${x.nome.replace('Strada da ', 'Strada<br>')}</div>`;
    const u = SCENA.unita[x.id];
    if (u) s += `<div style="position:absolute;left:${cx / W * 100}%;top:${cy / H * 100}%;transform:translate(-50%,-150%);display:flex;gap:4px">${u.map((k) => `<b style="font:700 11px Inter;padding:3px 7px;border-radius:999px;background:${p.badgeBg};color:${p.badgeTesto};border:${p.badgeBordo}">${{ S: '🦺', M: '🤝', Q: '👥' }[k[0]]} ${k.slice(1)}</b>`).join('')}</div>`; });
  el.style.position = 'relative'; el.innerHTML = s;
};
