// PO-098: contrasto dei testi sullo sfondo giallo della pagina (WCAG 2.x, AA per testo normale: ≥ 4,5:1).
// Per ogni elemento visibile con testo proprio si cerca lo sfondo effettivo risalendo gli antenati: se è quello della
// pagina (nessun antenato con un colore di fondo), si confronta il colore del testo col colore di fondo della pagina.
// Le vignette SVG hanno i loro colori e restano fuori. Fonte della formula: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
export async function controllaContrasto(pagina, atteso, nome) {
  const bassi = await pagina.evaluate(() => {
    const rgb = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const fondoPagina = rgb(getComputedStyle(document.body).backgroundColor);
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg') || !el.getClientRects().length) continue;
      const proprio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!proprio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      let a = el, sulGiallo = true;
      while (a && a !== document.body) { if (rgb(getComputedStyle(a).backgroundColor).a > 0.5) { sulGiallo = false; break; } a = a.parentElement; }
      if (!sulGiallo) continue;
      const t = rgb(cs.color), mix = { r: t.r * t.a + fondoPagina.r * (1 - t.a), g: t.g * t.a + fondoPagina.g * (1 - t.a), b: t.b * t.a + fondoPagina.b * (1 - t.a) };
      const [l1, l2] = [lum(mix), lum(fondoPagina)].sort((x, y) => y - x);
      const rapporto = (l1 + 0.05) / (l2 + 0.05);
      if (rapporto < 4.5) out.push(`«${el.textContent.trim().slice(0, 24)}» ${rapporto.toFixed(2)}:1`);
    }
    return out;
  });
  atteso(`${nome}: testi sul giallo sotto 4,5:1: ${bassi.join('; ')} (PO-098)`, !bassi.length);
}
