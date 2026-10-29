// C-054 · riassume i log di c054-gioca.mjs: morsi attesi/mostrati, scorrimento per chiusura, carta mai per ultima (nelle partite in interfaccia).
// Uso: node c054-analisi.mjs <log.json>...
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const l = JSON.parse(readFileSync(f, 'utf8')), cs = l.chiusure;
  // gruppi di scelte consecutive nella stessa ondata dello stesso episodio; un id già visto nel gruppo apre un gruppo nuovo (altro tentativo)
  const perOndata = {}; let cur = null, n = 0; for (const s of l.scelte) { if (!cur || cur.ep !== s.ep || cur.ondata !== s.ondata || cur.ids.includes(s.chiamata)) { cur = { ep: s.ep, ondata: s.ondata, ids: [] }; perOndata[`${s.ep}#${s.ondata}#${n++}`] = cur.ids; } cur.ids.push(s.chiamata); }
  const ondate = Object.entries(perOndata).filter(([, v]) => v.some((c) => c.startsWith('imp_')));
  const ultime = ondate.filter(([, v]) => v.length > 1 && v.at(-1).startsWith('imp_'));
  const scorrono = cs.filter((c) => c.scorr.y > 0 || c.scorr.x > 0 || (c.scorr.scena ?? 0) > 0);
  console.log(JSON.stringify({
    log: f.split('/').pop(), viewport: l.viewport, politica: l.politica, episodiConclusi: l.episodi.filter((e) => e.migliore && !e.migliore.fallita).length, tentativiTotali: l.episodi.length,
    chiusure: cs.length, chiusureConMorso: cs.filter((c) => c.attesi).length, morsiAttesi: cs.reduce((a, c) => a + c.attesi, 0), morsiMostrati: cs.reduce((a, c) => a + c.mostrati, 0),
    chiusureConTestiDiversiDaiDati: cs.filter((c) => !c.testiUguali).length, rapportoDiversoDaiMostrati: cs.filter((c) => c.radioNelRapportoUgualeAiMostrati === false).length,
    chiusureCheScorrono: scorrono.map((c) => `${c.ep} o${c.ondata}/${c.ondate} ${c.mostrati} morsi: y=${c.scorr.y}px`),
    ondateConCarta_UI: ondate.length, cartaPerUltima_UI: ultime.map(([k, v]) => `${k}: ${v.join(' ')}`),
  }, null, 1));
}
