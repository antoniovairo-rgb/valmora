// Durante l'ondata: le chiamate una alla volta (fonte, testo, commento del vice, opzioni), la risposta
// alla scelta, poi la chiusura col rapporto. Ogni scelta si salva subito: una ricarica riporta alla
// chiamata successiva (la risposta già letta non torna).
import { ChevronDown, ChevronRight, Coffee, FileText, Radio, Undo2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { spento } from '../../interruttori.ts';
import { opzioniEsaurite, opzioniValide, unitaFinita, type InCorso } from '../../logica/missione.ts';
import type { Chiamata as TChiamata, Missione, Opzione } from '../../logica/tipi.ts';
import type { Decisione } from '../../logica/sospesa.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { LETTERE, Mittente } from './Fumetto.tsx';
import { Messaggio } from './Scena.tsx';
import { iconaChi, VignettaChiamata } from '../vignette-chiamata.tsx';
import { urgente } from '../vignette-evento.tsx';
import { altoNellaPagina, scorriPerIntero } from '../vista.ts';
import { EffettiOpzione, quandoCosta } from '../effetti-opzione.tsx';


/** PO-121 (D-148): per quanti secondi la risposta a una chiamata si può annullare. */
export const ANNULLA_SECONDI = 5;
/** Durata di un «secondo» del conto alla rovescia. Solo per gli strumenti: il giro foto (che risponde a centinaia di
 *  chiamate) mette globalThis.__VALMORA_SECONDO_MS = 1 per non aspettare il tempo reale; la prova di PO-121
 *  (tools/foto-po121.mjs) non lo mette e misura i 5 s veri. */
export const secondoMs = () => (globalThis as { __VALMORA_SECONDO_MS?: number }).__VALMORA_SECONDO_MS ?? 1000;

export function Chiamata(p: { m: Missione; ic: InCorso; c: TChiamata; numero: number; totale: number; rispondi: (opzione: string) => void;
  sospendi?: (opzione: string) => boolean; decidi?: (esito: Decisione) => void }) {
  // Al primo tocco le opzioni si bloccano: un secondo tocco non cambia la scelta (C-005 R01).
  const [scelta, setScelta] = useState<string | null>(null);
  // PO-121 (D-148): la scelta resta in sospeso ANNULLA_SECONDI secondi con «Annulla» e il conto alla rovescia; scaduti,
  // diventa definitiva. Il fuoco non va su «Annulla» (un Invio involontario non annulla): resta sull'opzione scelta, che
  // non si può ripremere. Senza sospendi (rosso C107A01) la risposta vale subito, come prima.
  const [resta, setResta] = useState(0);
  const { decidi } = p;
  useEffect(() => {
    if (!resta) return;
    const id = setTimeout(() => { if (resta > 1) setResta(resta - 1); else { setResta(0); decidi?.('confermata'); } }, secondoMs());
    return () => clearTimeout(id);
  }, [resta, decidi]);
  const annulla = () => { setResta(0); setScelta(null); decidi?.('annullata'); };
  // «Annulla» compare sotto le opzioni: la pagina scorre fin lì (senza dargli il fuoco), così si vede subito
  const barraAnnulla = useRef<HTMLDivElement>(null), aperto = resta > 0;
  useLayoutEffect(() => { if (aperto) barraAnnulla.current?.scrollIntoView({ block: 'nearest' }); }, [aperto]);
  // C-010 C09-03: se le opzioni sono sotto la piega, un indicatore in basso dice che c'è da scorrere.
  const opzioni = useRef<HTMLDivElement>(null);
  const urgenteQui = urgente(p.m, p.c, p.ic.variabili); // D-126 c: spicchio e «Urgente!» solo con un evento sul settore
  // C28-02: col mouse, alla nuova chiamata l'opzione sotto il puntatore fermo appariva già accesa (106/156): l'evidenza
  // al passaggio vale solo dopo che il puntatore si è mosso. Rosso C87H01: subito, come prima.
  const [fermo, setFermo] = useState(true);
  useEffect(() => {
    if (spento('C87H01')) { setFermo(false); return; }
    setFermo(true);
    const via = () => setFermo(false);
    addEventListener('pointermove', via, { once: true });
    return () => removeEventListener('pointermove', via);
  }, [p.c.id]);
  const [nascoste, setNascoste] = useState(false);
  const [serve, setServe] = useState(false); // C18-05: una volta comparso nel fumetto resta, così il testo non salta scorrendo
  // Calcolo diretto (non IntersectionObserver, che risponde solo attraversando soglie e in ritardo): prima del disegno,
  // a ogni scorrimento e ridimensionamento e quando cambia il layout della pagina (mappa pronta, caratteri caricati).
  useLayoutEffect(() => {
    const el = opzioni.current?.querySelector('.opzione'); // la prima opzione deve vedersi tutta
    if (!el) return;
    const misura = () => {
      const r = el.getBoundingClientRect();
      const visibile = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      const n = r.height > 0 && visibile / r.height < 0.99;
      setNascoste(n); if (n) setServe(true);
    };
    misura();
    addEventListener('scroll', misura, { passive: true }); addEventListener('resize', misura);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(misura);
    ro?.observe(document.body);
    return () => { removeEventListener('scroll', misura); removeEventListener('resize', misura); ro?.disconnect(); };
  }, []);
  // C25-08: all'apertura (e quando compare «Rispondi», che sposta il fumetto) l'icona di chi chiama non resta tagliata
  // dal fondo della finestra: la pagina scorre quanto basta. Posizione dall'impaginazione, non dall'animazione d'entrata.
  useLayoutEffect(() => {
    const b = document.querySelector<HTMLElement>('.chiamata-corpo [data-chi-icona]');
    if (!b) return;
    const alto = altoNellaPagina(b) - scrollY, margine = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spazio-2')) || 0;
    const d = scorriPerIntero(alto, alto + b.offsetHeight, innerHeight, margine);
    if (d) scrollBy({ top: d, behavior: 'instant' });
  }, [p.c.id, serve]);
  const indicatore = (
    <button type="button" className="indicatore" data-indicatore="opzioni" onClick={() => opzioni.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
      Rispondi <Icona di={ChevronDown} />
    </button>
  );
  return (
    <>
      <Messaggio key={p.c.id} classe="radio ultimo" dati={`chiamata-${p.c.id}`}>
        {/* C22-09: l'avatar segue la stessa regola dell'icona accanto alla vignetta (prima: 222/498 chiamate con l'icona generica). Rosso C59A01 */}
        <Mittente icona={(!spento('C59A01') && iconaChi(p.c.fonte)) || iconaFonte(p.c.fonte)} nome={t(`fonte.${p.c.fonte}`)} etichetta={p.c.settore ? t(`settore.${p.c.settore}`) : undefined} timbro={urgenteQui ? 'Urgente!' : undefined} urgenza={urgenteQui && !spento('C51O01')} />
        {/* C18-05: «Rispondi» dentro il fumetto, sotto il mittente: fisso in basso copriva il testo. Rosso C42R01: fisso. */}
        {serve && !spento('C42R01') && indicatore}
        {/* PO-089 (scelta A del PO): vignetta piccola a sinistra del testo, dentro il fumetto */}
        <div className="chiamata-corpo">
          <VignettaChiamata m={p.m} c={p.c} variabili={p.ic.variabili} chiFuori />
          <div>
            <p className="testo-radio">{t(p.c.testo)}</p>
            {p.c.commento && <p className="vice-a-margine"><span className="chi-vice">Il vice — </span>{t(p.c.commento)}</p>}
          </div>
        </div>
      </Messaggio>
      {nascoste && spento('C42R01') && indicatore}
      <div className="opzioni" ref={opzioni} role="group" aria-label="Che cosa rispondi?" data-fermo={fermo ? '' : undefined}>
        {opzioniValide(p.c, p.ic, p.m).map((o, i) => (
          <button key={o.id} className={`opzione${scelta === o.id ? ' scelta' : ''}`} data-opzione={o.id} disabled={scelta !== null && !spento('C05R01') && !(resta && scelta === o.id)}
            aria-disabled={resta && scelta === o.id ? true : undefined}
            onClick={() => { if (scelta !== null && !spento('C05R01')) return; setScelta(o.id); if (p.sospendi?.(o.id)) setResta(ANNULLA_SECONDI); else p.rispondi(o.id); }}>
            <span className="tasto" aria-hidden="true">{LETTERE[i]}</span>
            <span className="opzione-testo">
              {t(o.testo)}
              {/* Accenno di costo in parole (D-078); interruttore rosso C05S05 lo nasconde */}
              {o.costo && !spento('C05S05') && <small className="costo" data-costo={o.id}>{t(o.costo)}</small>}
              {quandoCosta(o) && <small className="costo costo-quando" data-quando={o.id}>{quandoCosta(o)}</small>}
              <EffettiOpzione c={p.c} o={o} />
            </span>
          </button>
        ))}
        {/* D-153 (C35-02): la risposta che impegna un'unità finita resta in vista, disattivata, col motivo che nomina l'unità
            (testi «esaurita.<risorsa>»; data-costo per il controllo D-078). Rosso C153A01: sparisce */}
        {opzioniEsaurite(p.c, p.ic, p.m).map((o, i) => (
          <button key={o.id} className="opzione esaurita" data-opzione={o.id} data-esaurita="" disabled aria-disabled="true">
            <span className="tasto" aria-hidden="true">{LETTERE[opzioniValide(p.c, p.ic, p.m).length + i]}</span>
            <span className="opzione-testo">
              {t(o.testo)}
              <small className="costo motivo-esaurita" data-costo={o.id}>{t(`esaurita.${unitaFinita(p.m, p.ic, o) ?? 'squadre'}`)}</small>
            </span>
          </button>
        ))}
      </div>
      {resta > 0 && (
        <div className="riga annulla-risposta" role="status" ref={barraAnnulla}>
          <button type="button" className="pulsante secondario" data-annulla data-azione="annulla-risposta" onClick={annulla} aria-label={`Annulla la risposta (${resta} secondi)`}>
            <Icona di={Undo2} />Annulla <span className="conto" data-conto={resta}>{resta}</span>
          </button>
        </div>
      )}
    </>
  );
}

export function Risposta(p: { m: Missione; ic: InCorso; o: Opzione; avanti: () => void }) {
  return (
    <>
      <Messaggio classe="scelta" dati="scelta"><p className="testo-radio">{t(p.o.testo)}</p></Messaggio>
      {p.o.risposta && <Messaggio ritardo={0.15} classe="vice" dati="risposta"><Mittente icona={Coffee} nome="Intanto…" vice /><p>{t(p.o.risposta)}</p></Messaggio>}
      <button className="pulsante" data-azione="continua" onClick={p.avanti}>Avanti<Icona di={ChevronRight} /></button>
    </>
  );
}

export function Chiusura(p: { m: Missione; ic: InCorso; chiudi: () => void }) {
  return (
    <>
      <Messaggio classe="radio ultimo">
        <Mittente icona={Radio} nome="Centrale" timbro="In corso" />
        <p className="testo-radio">La radio tace. Le unità sono ai loro posti: l'ondata fa il suo corso.</p>
      </Messaggio>
      <button className="pulsante" data-azione="rapporto" onClick={p.chiudi}><Icona di={FileText} />Leggi il rapporto</button>
    </>
  );
}
