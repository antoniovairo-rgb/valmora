// Sonda C-022: per ogni chiamata dei dati, l'icona dell'avatar del mittente (regole di src/resa/icone.tsx:8-13) contro
// il disegno di chi chiama nella vignetta (regole di src/resa/vignette-chiamata.tsx:18-23), ricopiate qui.
// Uso: node coordination/sonde/c22-fonti.mjs
import { join, resolve } from 'node:path';
const { missioniDai } = await import(`${resolve('.')}/tools/foto-bozze.mjs`); const { missioni } = missioniDai(join(resolve('.'), 'data'));
const FONTI = [[/radio/, 'Radio'], [/rete|social/, 'Globe'], [/telefon/, 'Phone'], [/informatore/, 'UserRound'], [/ufficio|verbale|rapporto/, 'FileText']];
const avatar = (id) => FONTI.find(([re]) => re.test(id))?.[1] ?? 'MessageSquare';
const RADIO = ['centrale_radio', 'comando', 'viabilita', 'struttura_vertice']; const RETE = ['voci_in_rete', 'stampa_locale', 'cronista', 'messaggio_anonimo'];
const UFFICI = ['ufficio_', 'club_', 'ferrovie', 'biglietteria', 'sindacato_steward', 'organizzatori_', 'segreteria_comune', 'cerimoniale', 'servizio_ordine', 'gemellati'];
const chi = (f) => (f === 'vice' ? 'vice' : RADIO.includes(f) ? 'radio' : RETE.includes(f) ? 'rete' : UFFICI.some((u) => f.startsWith(u)) ? 'ufficio' : 'telefono');
const coppie = {}; let n = 0;
for (const m of missioni) for (const o of m.ondate) for (const c of o.chiamate ?? []) { n++; const k = `${avatar(c.fonte)} → ${chi(c.fonte)}`; (coppie[k] ??= new Set()).add(c.fonte); coppie[k].n = (coppie[k].n ?? 0) + 1; }
console.log(`chiamate ${n}`); for (const [k, s] of Object.entries(coppie).sort((a, b) => b[1].n - a[1].n)) console.log(`${String(s.n).padStart(4)}  ${k}  (${[...s].slice(0, 8).join(', ')}${s.size > 8 ? ', …' : ''})`);
