// Misura S-15 (D-189 §1): la regola 1 sulle 43 opzioni neutralizzate da D-160, solo in memoria. Uso: node tools/misura-s15-conflitto.mjs
import { leggiDati } from './dati-disco.mjs';
import { perverseRapide, deltaFallite, correlazioniCasuale } from './misura-fiducia.mjs';
import { readFileSync } from 'node:fs';
const tolte = JSON.parse(readFileSync('tests/dati/fiducia-d160.json', 'utf8')).tolte;
const R1 = `e25/rigore_ospiti/steward_sedie -1|e25/corteo_ritorno/percorso_corto -1|e25/treno_orario/trattieni_treno -1|e26/auto_autorita/corridoio 1|e26/auto_autorita/ingresso_laterale -1|e26/cori_tribuna/sposta_ospite -1|e26/premiazione/premiazione_tribuna -1|e26/foto_coppa/niente_foto -1|e26/piazzale_maxischermo/spegni_schermo -1|e27/messaggio_dessi/lascia_video -1|e27/rovers_provocati/steward_rovers -1|e27/binario/sala_attesa -1|e28/curva_non_tranquilla/chiedi_club -1|e28/mossgarth_rumore/niente_settore -1|e28/cronista_voci/smentisci -1|e28/rapporto_comando/fonti_protette -1|e29/speaker_partita/niente_annuncio -1|e29/notizia_in_curva/sospendi_partita -1|e29/conferenza/in_fondo -1|e30/clacson/corsia_auto -1|e30/sotto_il_municipio/niente_sanzioni -1|e30/silenzio_totale/parla_club -1|e30/lettera_curva/accetta_incontro -1|e31/comando_vuole/copia_prima -1|e31/costruttore_saluta/manda_vice -1|e31/cronista_cartella/dai_cronista -1|e31/consegna_fascicolo/a_stampa -1|e32/due_cortei/ferma_larkspire -1|e32/incrocio/luci -1|e32/verbale_derby/nessun_nome -1|e32/fumogeni_cinderwick/sospendi -1|e33/mossgarth_fumo/steward_fumo_ospiti -1|e33/tornelli_falsi/chiudi_occhio -1|e34/curva_ti_canta/ignora_coro -1|e34/uscita_commissione/uscita_laterale -1|e35/posto_prenotato/ferma_uomo 1|e35/posto_prenotato/lascia_partire -1|e35/barca_ritorno/ferma_barca 1|e36/messaggio_carcere/portavoce_smentisce -1|e36/comando_conti/frase_dura -1|e36/conti_procura/procura_frase_dura -1|e36/conti_stampa/stampa_frase_dura -1|e36/conti_comando/comando_frase_dura -1`.split('|').map((x) => x.split(' '));
const d = leggiDati(); const v = structuredClone(d); const fuori = [];
for (const [k, val] of R1) { if (!(k in tolte)) fuori.push(`${k} non è fra le 224 di D-160`); const [ep, c, o] = k.split('/');
  const op = v[`missioni/${ep}.json`].ondate.flatMap((x) => x.chiamate ?? []).find((x) => x.id === c)?.opzioni.find((x) => x.id === o);
  if (!op) { fuori.push(`${k} non trovata`); continue; } op.effetti.push({ aggiungi: 'credito', valore: Number(val) }); }
const chiavi = new Set(R1.map((x) => x[0]));
const pb = perverseRapide(d, 200), pv = perverseRapide(v, 200);
const dfb = deltaFallite(d), dfv = deltaFallite(v); const cv = correlazioniCasuale(v);
console.log(JSON.stringify({ n: R1.length, fuori, perverseBase: pb.length, perverseVariante: pv.length, soglia: 30,
  nuovePerverseFraLeR1: pv.filter((o) => chiavi.has(o.chiave)).map((o) => `${o.chiave} nom ${o.nominale} z ${o.z} fallite ${o.falliteSe}/${o.falliteAltre}`),
  altreNuove: pv.filter((o) => !chiavi.has(o.chiave) && !pb.some((p) => p.chiave === o.chiave)).map((o) => o.chiave),
  deltaFallitePositivi: Object.entries(dfv).filter(([, x]) => x !== null && x > 0).map(([k, x]) => `${k} ${x.toFixed(2)}`),
  corrNonNeg: Object.entries(cv).filter(([, x]) => x === null || x >= 0).map(([k, x]) => `${k} ${x}`) }, null, 1));
