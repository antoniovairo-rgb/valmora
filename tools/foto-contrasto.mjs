// PO-098, C19-04: contrasto di OGNI testo sul suo fondo effettivo (WCAG 2.x, AA: ≥ 4,5:1; testo grande ≥ 3:1, cioè
// ≥ 24 px o ≥ 18,66 px in grassetto). Il fondo si cerca risalendo gli antenati fino al primo con un colore di fondo
// pieno; se nessuno ce l'ha, è la pagina gialla. Restano fuori: vignette SVG, la mappa (testi su tela disegnata),
// fondi a immagine e comandi disattivati (WCAG li esenta). Fonte: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
// e https://www.w3.org/TR/WCAG21/#contrast-minimum («large scale», «incidental»).
export async function controllaContrasto(pagina, atteso, nome) {
  const bassi = await pagina.evaluate(() => {
    const rgb = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const fondoPagina = rgb(getComputedStyle(document.body).backgroundColor);
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg') || el.closest('.mappa') || el.closest(':disabled') || !el.getClientRects().length) continue;
      const proprio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!proprio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      let a = el, fondo = fondoPagina, immagine = false;
      while (a && a !== document.body) {
        const s = getComputedStyle(a);
        if (rgb(s.backgroundColor).a > 0.5) { fondo = rgb(s.backgroundColor); break; }
        if (s.backgroundImage !== 'none') { immagine = true; break; }
        a = a.parentElement;
      }
      if (immagine) continue;
      const t = rgb(cs.color), mix = { r: t.r * t.a + fondo.r * (1 - t.a), g: t.g * t.a + fondo.g * (1 - t.a), b: t.b * t.a + fondo.b * (1 - t.a) };
      const [l1, l2] = [lum(mix), lum(fondo)].sort((x, y) => y - x);
      const rapporto = (l1 + 0.05) / (l2 + 0.05);
      const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
      if (rapporto < (grande ? 3 : 4.5)) out.push(`«${el.textContent.trim().slice(0, 24)}» ${rapporto.toFixed(2)}:1`);
    }
    return [...new Set(out)];
  });
  atteso(`${nome}: testi sotto il contrasto minimo (4,5:1; 3:1 se grandi): ${bassi.join('; ')} (PO-098, C19-04)`, !bassi.length);
}

/** PO-098 (WCAG 1.4.11, componenti non testuali): ogni riquadro con un fondo suo, posato direttamente sulla pagina
 *  gialla, si stacca dallo sfondo con almeno 3:1, col fondo o col bordo. Fonte: https://www.w3.org/TR/WCAG21/#non-text-contrast */
export async function trovaRiquadri(pagina) {
  return pagina.evaluate(() => {
    const rgb = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const rapp = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
    const pag = rgb(getComputedStyle(document.body).backgroundColor);
    const out = [];
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('svg') || !el.getClientRects().length) continue;
      const cs = getComputedStyle(el), f = rgb(cs.backgroundColor);
      if (f.a < 0.5) continue;
      let a = el.parentElement, sullaPagina = true;
      while (a && a !== document.body) { if (rgb(getComputedStyle(a).backgroundColor).a > 0.5) { sullaPagina = false; break; } a = a.parentElement; }
      if (!sullaPagina) continue;
      const bordo = ['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(cs[`border${k}Width`]) >= 1 && rgb(cs[`border${k}Color`]).a > 0.5 && rapp(rgb(cs[`border${k}Color`]), pag) >= 3);
      const r = rapp(f, pag), nome = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} «${el.textContent.trim().slice(0, 20)}»`;
      // un fondo identico alla pagina senza bordo non disegna un riquadro (es. la barra fissa dello schieramento)
      if (r < 3 && r > 1.01 && !bordo) out.push(`${nome} fondo ${r.toFixed(2)}:1`);
      // strisce laterali (bordo spesso, di colore diverso dal resto): si devono vedere contro la pagina o contro il fondo
      for (const k of ['Top', 'Right', 'Bottom', 'Left']) {
        const c = rgb(cs[`border${k}Color`]);
        if (parseFloat(cs[`border${k}Width`]) >= 2 && c.a > 0.5 && rapp(c, pag) < 3 && rapp(c, f) < 3) out.push(`${nome} striscia ${k.toLowerCase()} ${Math.max(rapp(c, pag), rapp(c, f)).toFixed(2)}:1`);
      }
    }
    // icone e stelle: il tratto si stacca dal fondo su cui stanno
    for (const ic of document.querySelectorAll('main svg.stella, main svg.icona')) {
      if (!ic.getClientRects().length) continue;
      let a = ic.parentElement, fondo = pag;
      while (a && a !== document.body) { const c = rgb(getComputedStyle(a).backgroundColor); if (c.a > 0.5) { fondo = c; break; } a = a.parentElement; }
      const tratto = rgb(getComputedStyle(ic).color), r = rapp(tratto, fondo);
      if (r < 3) out.push(`icona ${[...ic.classList].join('.')} in «${ic.parentElement?.textContent.trim().slice(0, 20)}» ${r.toFixed(2)}:1`);
    }
    return out;
  });
}
export async function controllaRiquadri(pagina, atteso, nome) {
  const bassi = await trovaRiquadri(pagina);
  atteso(`${nome}: riquadri che non si staccano dal giallo (fondo e bordo sotto 3:1): ${bassi.join('; ')} (PO-098)`, !bassi.length);
}
