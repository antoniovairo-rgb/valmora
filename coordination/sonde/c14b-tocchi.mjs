// Collaudo C-014b, compito 4: doppio tocco veloce sul pulsante principale di ogni schermata e tasto
// «indietro» del browser su ogni schermata, durante e01 a 375 px. Il doppio tocco sostituisce il
// tocco singolo della schermata; lo stato (scena, ondata, risposte, rapporti) è letto dal salvataggio.
// Uso: node coordination/sonde/c14b-tocchi.mjs  → out/c14b/tocchi.json
import { avviaServer, apriBrowser, nuovaPagina, attendiScena, scenaCorrente, salvato, scrivi, attesa, MISURE } from './c14b-lib.mjs';

const [larg, alt] = MISURE[1];
const { srv, url } = await avviaServer();
const b = await apriBrowser();
const p = await nuovaPagina(b, url, [larg, alt]);
const R = [];
const nota = (x) => { R.push(x); console.log(JSON.stringify(x)); };

async function stato() {
  const s = await salvato(p);
  const ic = s?.in_corso;
  return { scena: await scenaCorrente(p), ondata: ic?.ondata ?? null, risposte: ic ? Object.keys(ic.risposte).length : null, rapporti: ic ? ic.rapporti.length : null, citta: s && !ic ? 'sì' : null };
}

/** Test «indietro» del browser sulla schermata corrente; se esce dal gioco lo riporta con «Riprendi». */
async function indietro(scena, conPila = true) {
  const u0 = p.url(); const prima = await stato();
  // conPila: si aggiunge una voce di cronologia (come farebbe un'app), così «indietro» resta nella pagina; senza, si misura la pagina grezza
  if (conPila) await p.evaluate(() => history.pushState({ c14b: 1 }, ''));
  await p.goBack({ timeout: 3000 }).catch(() => null);
  await attesa(p, 700);
  const dopo = { url: p.url(), scena: await scenaCorrente(p) };
  const esito = dopo.url !== u0 ? 'uscito dalla pagina del gioco' : dopo.scena === prima.scena ? 'nessun effetto' : `cambia scena in ${dopo.scena}`;
  nota({ test: 'indietro', variante: conPila ? 'con voce di cronologia' : 'pagina grezza', scena, esito, urlDopo: dopo.url, scenaDopo: dopo.scena });
  if (dopo.url !== u0) {
    await p.goto(url); await attendiScena(p, ['titolo']);
    const r = p.getByRole('button', { name: 'Riprendi' });
    if (await r.count()) await r.click();
    else { await p.getByRole('button', { name: 'Nuova partita' }).click(); await attendiScena(p, ['genere']); await p.click('[data-genere="m"]'); }
    await attendiScena(p, ['citta', 'sala', 'briefing', 'schieramento', 'chiamata', 'risposta', 'chiusura', 'rapporto', 'verbale'], 8000);
    nota({ test: 'ripresa dopo indietro', scenaPrima: scena, scenaDopo: await scenaCorrente(p) });
  }
}

/** Doppio tocco veloce sul pulsante indicato; confronta lo stato prima e dopo. */
async function doppio(nome, selettore) {
  const prima = await stato(); const e0 = p.errori.length;
  const loc = p.locator(selettore).first();
  if (!(await loc.count())) { nota({ test: 'doppio tocco', pulsante: nome, esito: 'pulsante assente' }); return; }
  await loc.dblclick({ timeout: 3000, delay: 0 }).catch((e) => nota({ test: 'doppio tocco', pulsante: nome, errore: e.message.split('\n')[0] }));
  await attesa(p, 800);
  const dopo = await stato();
  nota({ test: 'doppio tocco', pulsante: nome, prima, dopo, errori: p.errori.slice(e0) });
}

async function e01() {
  await attendiScena(p, ['titolo']);
  await p.getByRole('button', { name: 'Nuova partita' }).click();
  await attendiScena(p, ['genere']);
  await indietro('genere', false);
  await indietro('genere', true);
  await doppio('genere: Ho scelto Maschile', '[data-genere="m"]');
  await attendiScena(p, ['citta'], 8000); await attesa(p, 800);
  await indietro('citta');
  await doppio('citta: Avvia l\'episodio', '[data-azione="avvia-episodio"]');
  for (let giro = 0; giro < 400; giro++) {
    const fase = await attendiScena(p, ['sala', 'briefing', 'schieramento', 'chiamata', 'risposta', 'chiusura', 'rapporto', 'verbale', 'citta'], 12000);
    if (!fase) { nota({ test: 'fermo', scena: await scenaCorrente(p) }); break; }
    await attesa(p, 350);
    await indietro(fase, true);
    if (fase === 'citta') break;
    if (fase === 'sala') {
      await p.waitForSelector('[data-azione="passo"],[data-azione="avanti"]', { timeout: 8000 });
      if (await p.locator('[data-azione="avanti"]').count()) await doppio('sala: Ascolta le fonti', '[data-azione="avanti"]');
      else await doppio('sala: passo', '[data-azione="passo"]');
    } else if (fase === 'briefing') {
      await p.waitForSelector('[data-azione="passo"],[data-azione="inizia"]', { timeout: 8000 });
      if (await p.locator('[data-azione="inizia"]').count()) await doppio('briefing: Alla prima ondata', '[data-azione="inizia"]');
      else await doppio('briefing: passo', '[data-azione="passo"]');
    } else if (fase === 'schieramento') {
      await doppio('schieramento: Conferma', '[data-azione="conferma"]');
    } else if (fase === 'chiamata') {
      await doppio('chiamata: prima opzione', '[data-opzione]');
    } else if (fase === 'risposta') {
      await doppio('risposta: Avanti', '[data-azione="continua"]');
    } else if (fase === 'chiusura') {
      await doppio('chiusura: Leggi il rapporto', '[data-azione="rapporto"]');
    } else if (fase === 'rapporto') {
      await doppio('rapporto: Avanti', '[data-azione="avanti"]');
    } else if (fase === 'verbale') {
      const rigioca = await p.locator('[data-azione="rigioca"]').count();
      if (rigioca) { nota({ test: 'verbale', esito: 'fallita, rigioca' }); await doppio('verbale: Rigioca', '[data-azione="rigioca"]'); }
      else await doppio('verbale: Alla mappa della città', '[data-azione="citta"]');
    }
  }
}

await e01();
scrivi('tocchi.json', R);
console.log(`righe ${R.length}`);
await b.close(); srv.close();
