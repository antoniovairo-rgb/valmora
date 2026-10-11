// Durante l'ondata: le chiamate una alla volta (fonte, testo, commento del vice, opzioni), la risposta
// alla scelta, poi la chiusura col rapporto. Ogni scelta si salva subito: una ricarica riporta alla
// chiamata successiva (la risposta già letta non torna).
import { ChevronRight, FileText } from 'lucide-react';
import { opzioniValide, type InCorso } from '../../logica/missione.ts';
import type { Chiamata as TChiamata, Missione, Opzione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { Messaggio } from './Scena.tsx';

const testata = (m: Missione, ic: InCorso, cosa: string) => `Episodio ${m.episodio} · Ondata ${ic.ondata} di ${m.ondate.length} · ${cosa}`;

export function Chiamata(p: { m: Missione; ic: InCorso; c: TChiamata; numero: number; totale: number; rispondi: (opzione: string) => void }) {
  return (
    <>
      <p className="sopratitolo">{testata(p.m, p.ic, `Chiamata ${p.numero} di ${p.totale}`)}</p>
      <Messaggio key={p.c.id} classe="radio ultimo" dati={`chiamata-${p.c.id}`}>
        <strong className="chi"><Icona di={iconaFonte(p.c.fonte)} />{t(`fonte.${p.c.fonte}`)}</strong>
        <p>{t(p.c.testo)}</p>
        {p.c.settore && <p className="tenue">Settore: {t(`settore.${p.c.settore}`)}</p>}
      </Messaggio>
      {p.c.commento && <p className="vice-a-margine"><span className="chi">Il vice:</span> {t(p.c.commento)}</p>}
      <div className="opzioni" role="group" aria-label="Che cosa rispondi?">
        {opzioniValide(p.c, p.ic).map((o) => (
          <button key={o.id} className="pulsante opzione" data-opzione={o.id} onClick={() => p.rispondi(o.id)}>{t(o.testo)}</button>
        ))}
      </div>
    </>
  );
}

export function Risposta(p: { m: Missione; ic: InCorso; o: Opzione; avanti: () => void }) {
  return (
    <>
      <p className="sopratitolo">{testata(p.m, p.ic, 'La tua scelta')}</p>
      <Messaggio classe="scelta" dati="scelta"><p><strong>{t(p.o.testo)}</strong></p></Messaggio>
      {p.o.risposta && <Messaggio ritardo={0.15} classe="vice" dati="risposta"><p>{t(p.o.risposta)}</p></Messaggio>}
      <button className="pulsante" data-azione="continua" onClick={p.avanti}>Avanti<Icona di={ChevronRight} /></button>
    </>
  );
}

export function Chiusura(p: { m: Missione; ic: InCorso; chiudi: () => void }) {
  return (
    <>
      <p className="sopratitolo">{testata(p.m, p.ic, 'In corso')}</p>
      <Messaggio classe="radio ultimo">
        <p>La radio tace. Le unità sono ai loro posti: l'ondata fa il suo corso.</p>
      </Messaggio>
      <button className="pulsante" data-azione="rapporto" onClick={p.chiudi}><Icona di={FileText} />Leggi il rapporto</button>
    </>
  );
}
