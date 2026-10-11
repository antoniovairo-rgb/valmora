// Genera docs/governo/governo.html da ROADMAP.md, BACKLOG.md e STABILITA.json.
// Uso diretto: node tools/governo-html.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { righeBacklog } from './controlli.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function lotti(testo) {
  const sopra = testo.split('## Registro delle release')[0];
  return sopra.split(/\n(?=## L\d)/).filter((b) => b.startsWith('## L')).map((b) => {
    const campo = (n) => (b.match(new RegExp(`- ${n}: (.*)`)) || [, ''])[1];
    return { titolo: b.split('\n')[0].slice(3), stato: campo('Stato'), obiettivo: campo('Obiettivo'), uscita: campo("Criterio d'uscita") };
  });
}

export function generaGoverno() {
  const roadmap = readFileSync('docs/governo/ROADMAP.md', 'utf8');
  const voci = righeBacklog(readFileSync('docs/governo/BACKLOG.md', 'utf8'));
  const giri = existsSync('STABILITA.json') ? JSON.parse(readFileSync('STABILITA.json', 'utf8')).giri : [];

  const conta = {};
  for (const v of voci) { const s = v[4].split(/[ –(]/)[0] === 'IN' ? 'IN CODA' : v[4].split(/[ –(]/)[0]; conta[s] = (conta[s] || 0) + 1; }
  const aperte = voci.filter((v) => /^(IN CODA|PARZIALE)/.test(v[4]));
  const chiuse = voci.filter((v) => !/^(IN CODA|PARZIALE)/.test(v[4]));

  const perCatena = {};
  for (const g of giri) (perCatena[g.catena] ||= []).push(g);

  const riga = (v) => `<tr><td>${esc(v[0])}</td><td>${esc(v[2])}</td><td>${esc(v[4])}</td><td>${esc(v[5])}</td></tr>`;
  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Governo Valmora</title>
<style>
:root{--sfondo:#f6f5f2;--carta:#fff;--testo:#1d1d1f;--tenue:#6b6b70;--bordo:#e2e0da;--verde:#1f7a4d;--rosso:#b3261e;--giallo:#9a6a00}
@media (prefers-color-scheme:dark){:root{--sfondo:#141416;--carta:#1d1d20;--testo:#ececef;--tenue:#9a9aa2;--bordo:#2e2e33;--verde:#5cc28f;--rosso:#ff8a80;--giallo:#e0b44c}}
body{margin:0;background:var(--sfondo);color:var(--testo);font:15px/1.5 system-ui,sans-serif}
main{max-width:960px;margin:0 auto;padding:24px 16px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 10px}
.tenue{color:var(--tenue);font-size:13px}
.griglia{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.scheda{background:var(--carta);border:1px solid var(--bordo);border-radius:10px;padding:12px 14px}
.stato{font-size:12px;font-weight:600;letter-spacing:.04em}
.IN.CORSO,.IN{color:var(--giallo)}.CHIUSO{color:var(--verde)}.PROPOSTO{color:var(--tenue)}
.cifre{display:flex;gap:16px;flex-wrap:wrap}.cifre b{font-size:24px;display:block}
table{width:100%;border-collapse:collapse;background:var(--carta);border:1px solid var(--bordo);border-radius:10px;overflow:hidden;font-size:14px}
td,th{padding:7px 10px;border-bottom:1px solid var(--bordo);text-align:left;vertical-align:top}
.tab{overflow-x:auto}
.pallino{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:3px}
.verde{background:var(--verde)}.rosso{background:var(--rosso)}.instabile{background:var(--giallo)}
</style></head><body><main>
<h1>Governo Valmora</h1>
<div class="tenue">Generata il ${esc(new Date().toISOString().slice(0, 16).replace('T', ' '))} UTC da tools/governo-html.mjs</div>

<h2>Lotti</h2>
<div class="griglia">${lotti(roadmap).map((l) => `<div class="scheda"><div class="stato ${esc(l.stato)}">${esc(l.stato)}</div><strong>${esc(l.titolo)}</strong><p>${esc(l.obiettivo)}</p><div class="tenue">Uscita: ${esc(l.uscita)}</div></div>`).join('')}</div>

<h2>Voci del backlog</h2>
<div class="scheda cifre">${Object.entries(conta).map(([s, n]) => `<div><b>${n}</b><span class="tenue">${esc(s)}</span></div>`).join('')}<div><b>${voci.length}</b><span class="tenue">totale</span></div></div>
<h2>Aperte (${aperte.length})</h2>
<div class="tab"><table><tr><th>id</th><th>richiesta</th><th>stato</th><th>lotto</th></tr>${aperte.map(riga).join('')}</table></div>
<h2>Chiuse (${chiuse.length})</h2>
<div class="tab"><table><tr><th>id</th><th>richiesta</th><th>stato</th><th>lotto</th></tr>${chiuse.map(riga).join('')}</table></div>

<h2>Stabilità delle catene</h2>
${Object.keys(perCatena).length ? `<div class="tab"><table><tr><th>catena</th><th>giri</th><th>verdi</th><th>ultimi 20</th><th>ultimo</th></tr>${Object.entries(perCatena).map(([c, gs]) => `<tr><td>${esc(c)}</td><td>${gs.length}</td><td>${gs.filter((g) => g.esito === 'verde').length}</td><td>${gs.slice(-20).map((g) => `<span class="pallino ${esc(g.esito)}" title="${esc(g.commit)} ${esc(g.data)}"></span>`).join('')}</td><td>${esc(gs.at(-1).esito)} su ${esc(gs.at(-1).commit)}</td></tr>`).join('')}</table></div>` : '<p class="tenue">Nessun giro registrato.</p>'}
</main></body></html>
`;
  writeFileSync('docs/governo/governo.html', html);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) generaGoverno();
