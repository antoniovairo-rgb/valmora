// Crediti (D-052): ogni libreria e asset con licenza, autori e fonte.
import { ArrowLeft } from 'lucide-react';
import { CREDITI } from '../crediti.ts';
import { Icona } from '../icone.tsx';

export function Crediti(p: { indietro: () => void }) {
  return (
    <>
      <p className="sopratitolo">Crediti</p>
      <h1>Chi ha reso possibile Valmora</h1>
      <p className="tenue">Software libero usato dal gioco. Nessun asset con licenza CC BY è ancora presente; quando entrerà, qui comparirà l'autore di ognuno.</p>
      {CREDITI.map((c) => (
        <div className="scheda" key={c.nome} data-credito={c.nome}>
          <div className="riga"><strong>{c.nome}</strong><span className="etichetta">{c.licenza}</span></div>
          <p className="tenue">{c.uso} · {c.autori}</p>
          <p className="tenue fonte">{c.fonte}</p>
        </div>
      ))}
      <button className="pulsante" onClick={p.indietro}><Icona di={ArrowLeft} />Torna al titolo</button>
    </>
  );
}
