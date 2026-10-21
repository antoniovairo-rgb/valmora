// Privacy (PO-145, D-217): stesso testo della pagina web …/privacy/, da data/testi/it/privacy.json (src/dati/privacy.ts).
// Nessuna rete: il testo è nella build.
import { ArrowLeft } from 'lucide-react';
import { testoPrivacy } from '../../dati/privacy.ts';
import { testiTutti } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { Testata } from './Fumetto.tsx';

export function Privacy(p: { indietro: () => void }) {
  const t = testoPrivacy(testiTutti());
  return (
    <>
      <Testata numero="§" etichetta={t.titolo} titolo={t.sottotitolo} />
      <div data-privacy-testo>
        {t.paragrafi.map((x) => <p className="scheda privacy-paragrafo" key={x}>{x}</p>)}
      </div>
      <button className="pulsante" data-azione="privacy-indietro" onClick={p.indietro}><Icona di={ArrowLeft} />Torna al titolo</button>
    </>
  );
}
