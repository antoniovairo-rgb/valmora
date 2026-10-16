// Sonda C-029: D-129 a schermo, dalle uscite di c29-schermate.mjs. Per ogni chiamata mostrata: spicchio (data-urgenza) e
// timbro «Urgente!» letti sul fumetto di quella chiamata, contro l'atteso ricalcolato dalla sonda (eventi dell'ondata
// sullo stesso settore, «se» sulle variabili della partita, pressione ≥ 4). Uso: node coordination/sonde/c29-urgenza-analisi.mjs <uscite…>
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const { W, RIS } = JSON.parse(readFileSync(f, 'utf8')); const ch = RIS.filter((r) => r.scena.startsWith('chiamata-'));
  const urg = (r) => !!r.fumetto?.spicchio, tim = (r) => !!r.fumetto?.timbro?.includes('Urgente!');
  const male = ch.filter((r) => urg(r) !== r.atteso129 || tim(r) !== r.atteso129 || !r.fumetto);
  const disgiunti = ch.filter((r) => urg(r) !== tim(r));
  console.log(`${f.split('/').pop()} (W ${W}): chiamate ${ch.length}, con spicchio ${ch.filter(urg).length}, con «Urgente!» ${ch.filter(tim).length}, attese D-129 ${ch.filter((r) => r.atteso129).length}, attese D-126 c ${ch.filter((r) => r.atteso126).length}; diverse dall'atteso ${male.length}; spicchio senza timbro o viceversa ${disgiunti.length}; episodi ${new Set(ch.map((r) => r.ep)).size}`);
  for (const r of male.slice(0, 10)) console.log(`  ${r.ep} ${r.scena}: atteso ${r.atteso129} [${r.eventiSettore}:${r.pressioni}] mostrato ${JSON.stringify(r.fumetto)}`);
}
