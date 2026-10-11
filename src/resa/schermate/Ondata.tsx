// Durante l'ondata: le chiamate una alla volta (fonte, testo, commento del vice, opzioni), la risposta
// alla scelta, poi la chiusura col rapporto. Ogni scelta si salva subito: una ricarica riporta alla
// chiamata successiva (la risposta già letta non torna).
import { ChevronRight, Coffee, FileText, Radio } from 'lucide-react';
import { opzioniValide, type InCorso } from '../../logica/missione.ts';
import type { Chiamata as TChiamata, Missione, Opzione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { LETTERE, Mittente } from './Fumetto.tsx';
import { Messaggio } from './Scena.tsx';


export function Chiamata(p: { m: Missione; ic: InCorso; c: TChiamata; numero: number; totale: number; rispondi: (opzione: string) => void }) {
  return (
    <>
      <Messaggio key={p.c.id} classe="radio ultimo" dati={`chiamata-${p.c.id}`}>
        <Mittente icona={iconaFonte(p.c.fonte)} nome={t(`fonte.${p.c.fonte}`)} etichetta={p.c.settore ? t(`settore.${p.c.settore}`) : undefined} timbro="Urgente!" />
        <p className="testo-radio">{t(p.c.testo)}</p>
        {p.c.commento && <p className="vice-a-margine"><span className="chi-vice">Il vice — </span>{t(p.c.commento)}</p>}
      </Messaggio>
      <div className="opzioni" role="group" aria-label="Che cosa rispondi?">
        {opzioniValide(p.c, p.ic).map((o, i) => (
          <button key={o.id} className="opzione" data-opzione={o.id} onClick={() => p.rispondi(o.id)}>
            <span className="tasto" aria-hidden="true">{LETTERE[i]}</span><span>{t(o.testo)}</span>
          </button>
        ))}
      </div>
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
