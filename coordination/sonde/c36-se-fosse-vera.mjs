// Sonda C-036 (sola lettura, dati e testi): opzioni il cui costo dice «se fosse vera/o» (l'effetto dipende dalla verità
// di una voce) e i loro effetti, accanto alle fonti del briefing sullo stesso settore e alla loro verità (campo «vera»).
// Uso: node coordination/sonde/c36-se-fosse-vera.mjs [radice]
import { readFileSync, readdirSync } from 'node:fs'; import { join } from 'node:path';
const R = process.argv[2] ?? '.'; const T = {}; for (const f of readdirSync(join(R, 'data/testi/it'))) Object.assign(T, JSON.parse(readFileSync(join(R, 'data/testi/it', f), 'utf8')));
const t = (k) => T[k] ?? T[k + '@f'];
for (const f of readdirSync(join(R, 'data/missioni')).sort()) { const m = JSON.parse(readFileSync(join(R, 'data/missioni', f), 'utf8'));
  m.ondate.forEach((o, i) => o.chiamate.forEach((c) => c.opzioni.forEach((x) => {
    const costo = t(`${m.id}.op.${x.id}.c`) ?? ''; if (!/se (fosse|è|era) ver|se fosse vero|se la voce/i.test(costo)) return;
    const sett = c.settore; const fonti = (m.briefing ?? []).filter((b) => b.settore === sett || (x.effetti.some((e) => e.pressione === b.settore || e.tensione === b.settore)));
    console.log(`${m.id} o${i + 1} ${c.id}/${x.id} [fonte della chiamata: ${c.fonte ?? '-'}] «${costo}» effetti ${JSON.stringify(x.effetti)}${x.se ? ' se ' + JSON.stringify(x.se) : ''}\n   briefing sui settori toccati: ${fonti.map((b) => `${b.fonte} ${b.settore} vera=${b.vera}`).join(' · ') || '-'}`); })));
}
