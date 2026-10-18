// PO-126 (S-06): dalla partita registrata (partita.json) e dai problemi (problemi.json) la pagina docs/partita-az/index.html.
// Uso: node docs/partita-az/genera.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';

const P = JSON.parse(readFileSync('docs/partita-az/partita.json', 'utf8'));
const PROB = JSON.parse(readFileSync('docs/partita-az/problemi.json', 'utf8'));
const dati = leggiDati();
const stato = dati['stato.json'].variabili;
const missioni = Object.fromEntries(Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => [m.id, m]));
const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, v]) => v));
const t = (k) => testi[String(k).replace(/^testi:/, '')] ?? k;
const h = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Dove si legge una variabile di storia (condizioni) e dove si scrive (effetti), episodio per episodio. */
const usi = Object.fromEntries(stato.map((v) => [v.id, { legge: [], scrive: [] }]));
for (const m of Object.values(missioni)) {
  const j = JSON.stringify(m);
  for (const v of stato) {
    if (j.includes(`"var":"${v.id}"`)) usi[v.id].legge.push(m.id);
    if (j.includes(`"imposta":"${v.id}"`) || j.includes(`"aggiungi":"${v.id}"`)) usi[v.id].scrive.push(m.id);
  }
}
const STORIA = stato.filter((v) => !['tensione_max', 'credito'].includes(v.id));
const cambiate = (a, b) => STORIA.filter((v) => a && b && JSON.stringify(a[v.id]) !== JSON.stringify(b[v.id])).map((v) => ({ id: v.id, da: a[v.id], a: b[v.id], dopo: usi[v.id].legge.filter((x) => x > (b.__ep ?? '')) }));
const stelline = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const minuti = (e) => (e.parole / 200 + e.tocchi * 2 / 60);
const foto = (f, cap) => `<figure><img loading="lazy" src="foto/${h(f)}" alt="${h(cap)}" width="360" height="760"><figcaption>${h(cap)}</figcaption></figure>`;
const nomeFoto = (f) => f.replace(/^e\d\d-/, '').replace('.jpg', '').replace(/^(\d+)-/, 'tentativo $1 · ').replace('introduzione', 'introduzione (sala)').replace('rapporto', 'rapporto ondata ');

const eps = P.episodi;
const stagioni = [...new Set(eps.map((e) => e.stagione))];
const ultima = (e) => e.prove.at(-1);
const fallite = (e) => e.prove.filter((p) => p.fallita).length;

function scheda(e) {
  const m = missioni[e.id]; const fine = ultima(e);
  const prima = e.prove[0].fiducia_prima, dopo = fine.fiducia_dopo;
  const ch = cambiate(e.variabili_prima, e.variabili_dopo).map((c) => ({ ...c, dopo: usi[c.id].legge.filter((x) => x > e.id) }));
  const prove = e.prove.map((p) => `
    <details${p === fine ? ' open' : ''}><summary>Tentativo ${p.n}${p.ripartenza ? ` · ripartito dall'ondata ${p.ripartenza}` : ''} → <b class="${p.fallita ? 'male' : 'bene'}">${h(p.esito_testo)}</b> ${p.fallita ? '(fallito)' : stelline(p.stelle)}</summary>
    ${p.ondate.map((o) => `<div class="ondata"><h5>Ondata ${o.n}${o.titolo ? ` · ${h(o.titolo.replace(/^Ondata \d+\/\d+ · \S+ /, ''))}` : ''}</h5>
      <p class="pic">Schieramento: ${h(Object.entries(o.disposizione ?? {}).filter(([, ps]) => Object.keys(ps).length).map(([r, ps]) => `${t(`risorsa.${r}`)} → ${Object.entries(ps).map(([s, n]) => `${t(`settore.${s}`)} ${n}`).join(', ')}`).join(' · ') || '—')}</p>
      ${o.chiamate.map((c) => { const d = m.ondate[o.n - 1]?.chiamate?.find((x) => x.id === c.id); const op = d?.opzioni.find((x) => x.id === c.opzione);
        return d ? `<p class="chiamata"><span class="dom"><b>${h(t(`fonte.${d.fonte}`))}</b>${d.settore ? ` · ${h(t(`settore.${d.settore}`))}` : ''}: ${h(t(d.testo))}</span><span class="ris">→ <b>${h(t(op.testo))}</b>${op.risposta ? ` — ${h(t(op.risposta))}` : ''}</span></p>`
          : `<p class="chiamata"><span class="dom">${h(c.domanda)}</span><span class="ris">→ ${h(c.scelta)}</span></p>`; }).join('')}
      <p class="pic">Dopo l'ondata: tensione massima ${o.tensione_max ?? '?'}/10 · fiducia ${o.fiducia ?? '?'}/10</p></div>`).join('')}
    <p><b>Verbale:</b> «${h(p.verbale)}»</p>
    ${p.bilancio?.length ? `<p class="pic">${p.bilancio.map(h).join('<br>')}</p>` : ''}
    </details>`).join('');
  return `<article class="ep" id="${e.id}">
  <h4><span class="num">${String(e.episodio).padStart(2, '0')}</span> ${h(e.titolo)} <span class="esito ${fine.fallita ? 'male' : ''}">${stelline(fine.stelle)}</span></h4>
  <p class="meta">Stagione ${e.stagione} · tentativi ${e.tentativi} (falliti ${fallite(e)}) · tensione massima ${fine.tensione_max}/10 · fiducia ${prima} → ${dopo} · ~${minuti(e).toFixed(0)} min stimati · ${e.tocchi} tocchi</p>
  <p class="intro">${h((e.sala ?? '').slice(0, 420))}</p>
  <div class="foto">${e.foto.map((f) => foto(f, nomeFoto(f))).join('')}</div>
  ${e.sbagli.length ? `<p class="pic">Sbagli del giocatore (seme): ${e.sbagli.map(h).join(' · ')}</p>` : ''}
  ${ch.length ? `<p class="var"><b>Storia cambiata:</b> ${ch.map((c) => `<code>${h(c.id)}</code> ${h(c.da)} → <b>${h(c.a)}</b>${c.dopo.length ? ` (pesa in ${c.dopo.join(', ')})` : ' (nessun episodio dopo la legge)'}`).join('; ')}</p>` : '<p class="pic">Nessuna variabile di storia cambiata.</p>'}
  ${(PROB.note?.[e.id] ?? []).map((n) => `<p class="nota">${h(n)}</p>`).join('')}
  ${prove}
  </article>`;
}

function stagione(n) {
  const es = eps.filter((e) => e.stagione === n);
  const max = Math.max(...es.map((e) => e.tentativi), 1);
  const barre = es.map((e) => `<a class="barra" href="#${e.id}" title="${e.id}: ${e.tentativi} tentativi"><span style="height:${(e.tentativi / max) * 100}%" class="${fallite(e) ? 'f' : ''}"></span><small>${e.episodio}</small></a>`).join('');
  const tens = es.map((e) => `<a class="barra" href="#${e.id}"><span style="height:${(ultima(e).tensione_max / 10) * 100}%" class="t"></span><small>${e.episodio}</small></a>`).join('');
  const stelle = es.reduce((a, e) => a + ultima(e).stelle, 0);
  return `<section class="stagione" id="s${n}"><h2>Stagione ${n}</h2>
  <p class="meta">${es.length} episodi · tentativi ${es.reduce((a, e) => a + e.tentativi, 0)} · falliti ${es.reduce((a, e) => a + fallite(e), 0)} · stelle ${stelle}/${es.length * 3} · ~${es.reduce((a, e) => a + minuti(e), 0).toFixed(0)} min stimati</p>
  ${PROB.stagioni?.[n] ? `<div class="riass">${PROB.stagioni[n]}</div>` : ''}
  <h3>Tentativi per episodio</h3><div class="grafico">${barre}</div>
  <h3>Tensione massima finale (su 10)</h3><div class="grafico">${tens}</div>
  ${P.extra.filter((f) => f.includes(`s${n}`)).map((f) => foto(f, f.replace('.jpg', ''))).join('')}
  <ol class="indice">${es.map((e) => `<li><a href="#${e.id}">${String(e.episodio).padStart(2, '0')} · ${h(e.titolo)}</a> <span class="${fallite(e) ? 'male' : ''}">${stelline(ultima(e).stelle)}${e.tentativi > 1 ? ` · ${e.tentativi} tent.` : ''}</span></li>`).join('')}</ol>
  ${es.map(scheda).join('')}
  </section>`;
}

const peso = readdirSync('docs/partita-az/foto').reduce((a, f) => a + statSync(`docs/partita-az/foto/${f}`).size, 0);
const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Partita dalla A alla Z</title>
<style>
:root{--sf:#fbfaf6;--tx:#1d1d1f;--tn:#5a5a60;--bd:#ddd8cc;--ac:#c7002b;--ok:#0b7a3b;--ca:#fff;--gi:#f2c400}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--sf:#151517;--tx:#ececef;--tn:#a6a6ad;--bd:#34343a;--ac:#ff5a6e;--ok:#4fd18b;--ca:#1f1f23;--gi:#d8b000}}
:root[data-theme="dark"]{--sf:#151517;--tx:#ececef;--tn:#a6a6ad;--bd:#34343a;--ac:#ff5a6e;--ok:#4fd18b;--ca:#1f1f23;--gi:#d8b000}
*{box-sizing:border-box}body{margin:0;background:var(--sf);color:var(--tx);font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:.2em 0}h2{font-size:1.3rem;border-bottom:3px solid var(--gi);padding-bottom:4px;margin-top:2em}
h3{font-size:1rem;margin:1.2em 0 .4em}h4{font-size:1.05rem;margin:0 0 .3em}h5{margin:.6em 0 .2em;font-size:.92rem}
.meta,.pic{color:var(--tn);font-size:.88rem}.ep{background:var(--ca);border:1px solid var(--bd);border-radius:10px;padding:12px;margin:14px 0}
.num{display:inline-block;background:var(--tx);color:var(--sf);border-radius:4px;padding:0 6px;font-variant-numeric:tabular-nums}
.esito{color:var(--gi);white-space:nowrap}.male{color:var(--ac)}.bene{color:var(--ok)}
.foto{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory}figure{margin:0;flex:0 0 46%;max-width:180px;scroll-snap-align:start}
figure img{width:100%;height:auto;border-radius:6px;border:1px solid var(--bd)}figcaption{font-size:.75rem;color:var(--tn)}
.stagione>figure{display:inline-block;width:46%;max-width:180px;margin-right:8px}
details{border-top:1px solid var(--bd);margin-top:8px;padding-top:6px}summary{cursor:pointer;font-weight:600}
.chiamata{margin:.3em 0;font-size:.9rem}.dom{display:block;color:var(--tn)}.ris{display:block;padding-left:8px;border-left:3px solid var(--gi)}
.var{font-size:.88rem}.nota{font-size:.88rem;border-left:3px solid var(--ac);padding-left:8px}code{font-size:.85em}
.grafico{display:flex;align-items:flex-end;gap:3px;height:90px;border-bottom:1px solid var(--bd)}.barra{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;text-decoration:none;color:var(--tn);min-width:0}
.barra span{display:block;background:var(--ok);border-radius:3px 3px 0 0;min-height:2px}.barra span.f{background:var(--ac)}.barra span.t{background:var(--gi)}.barra small{font-size:.65rem;text-align:center}
.indice{columns:1;padding-left:1.2em}.indice span{color:var(--gi)}.indice span.male{color:var(--ac)}
table{border-collapse:collapse;width:100%;font-size:.88rem}td,th{overflow-wrap:anywhere;border:1px solid var(--bd);padding:4px 6px;text-align:left;vertical-align:top}
.grav{font-weight:700;white-space:nowrap}.g-alta{color:var(--ac)}.g-media{color:#c46a00}.g-bassa{color:var(--tn)}
nav.top{display:flex;gap:8px;flex-wrap:wrap}nav.top a{background:var(--ca);border:1px solid var(--bd);border-radius:20px;padding:4px 12px;text-decoration:none;color:var(--tx)}
.tab{overflow-x:auto;max-width:100%}.riass p{margin:.4em 0}
</style></head><body><main>
<h1>Valmora – Cortina di fumo · partita dalla A alla Z</h1>
<p class="meta">Una campagna intera giocata nel browser vero (Chromium, 360×760, asset veri) da «Nuova partita» al finale di e36, un solo salvataggio. Versione giocata <b>${h(P.game_version)}</b> (home: «${h(P.riga_home)}»), commit <b>${h(PROB.commit)}</b>. Giocatore: bot «attenta» di src/logica/bot.ts con sbagli a caso (risposta ${P.sbagli.risposta * 100}%, schieramento ${P.sbagli.schieramento * 100}% per ondata), seme «${h(P.seme)}». Foto: ${readdirSync('docs/partita-az/foto').length} JPEG, ${(peso / 1048576).toFixed(1)} MB. Rapporto testuale: docs/revisioni/PARTITA_AZ.md.</p>
<nav class="top"><a href="#evolve">Come evolve</a><a href="#problemi">Problemi</a>${stagioni.map((n) => `<a href="#s${n}">Stagione ${n}</a>`).join('')}<a href="#finale">Finale</a></nav>
<h2 id="evolve">Come evolve il gioco</h2>
<div class="riass">${PROB.evolve}</div>
<div class="tab"><table><tr><th>Stagione</th><th>Episodi</th><th>Tentativi</th><th>Falliti</th><th>Stelle</th><th>Min. stimati</th></tr>
${stagioni.map((n) => { const es = eps.filter((e) => e.stagione === n); return `<tr><td>${n}</td><td>${es.length}</td><td>${es.reduce((a, e) => a + e.tentativi, 0)}</td><td>${es.reduce((a, e) => a + fallite(e), 0)}</td><td>${es.reduce((a, e) => a + ultima(e).stelle, 0)}/${es.length * 3}</td><td>${es.reduce((a, e) => a + minuti(e), 0).toFixed(0)}</td></tr>`; }).join('')}
</table></div>
<p class="pic">Minuti stimati = parole lette a schermo / 200 al minuto + 2 secondi per tocco (stima dichiarata, non misura di tempo reale).</p>
<h2 id="problemi">Problemi trovati</h2>
<div class="tab"><table><tr><th>Gravità</th><th>Problema</th><th>Dove · misura</th><th>Opzioni (raccomandata per prima)</th></tr>
${PROB.problemi.map((p) => `<tr><td class="grav g-${p.gravita}">${p.gravita}</td><td><b>${h(p.id)}</b> ${h(p.titolo)}${p.tipo === 'IPOTESI' ? ' <i>(IPOTESI)</i>' : ''}</td><td>${h(p.dove)}${p.foto ? `<br><a href="foto/${h(p.foto)}">foto</a>` : ''}</td><td>${p.opzioni.map(h).join('<br>')}</td></tr>`).join('')}
</table></div>
${PROB.noti ? `<p class="pic">${h(PROB.noti)}</p>` : ''}
<h2>Inizio</h2>${P.extra.filter((f) => /^00-(titolo|genere|guida|citta-s1)/.test(f)).map((f) => foto(f, f.replace('.jpg', '').replace('00-', ''))).join('')}
${stagioni.map(stagione).join('')}
<h2 id="finale">Finale</h2><div class="riass">${PROB.finale ?? ''}</div>
${P.extra.filter((f) => /^99-/.test(f)).map((f) => foto(f, 'mappa della città dopo il finale')).join('')}
${eps.at(-1)?.foto.filter((f) => f.includes('finale')).map((f) => foto(f, 'ultimo passo del verbale di e36')).join('') ?? ''}
</main></body></html>`;
writeFileSync('docs/partita-az/index.html', html);
console.log(`index.html ${(html.length / 1024).toFixed(0)} KB, foto ${(peso / 1048576).toFixed(1)} MB`);
