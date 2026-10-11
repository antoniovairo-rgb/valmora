// Durante l'ondata: le chiamate una alla volta (fonte, testo, opzioni), poi la chiusura col rapporto.
// Ogni risposta si salva subito: una ricarica riporta alla stessa chiamata.
import { FileText } from 'lucide-react';
import { opzioniValide, type InCorso } from '../../logica/missione.ts';
import type { Chiamata as TChiamata, Missione } from '../../logica/tipi.ts';
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
      <div className="opzioni" role="group" aria-label="Che cosa rispondi?">
        {opzioniValide(p.c, p.ic).map((o) => (
          <button key={o.id} className="pulsante opzione" data-opzione={o.id} onClick={() => p.rispondi(o.id)}>{t(o.testo)}</button>
        ))}
      </div>
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
