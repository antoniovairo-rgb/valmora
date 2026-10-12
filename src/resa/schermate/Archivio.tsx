// Esporta e importa la partita come file (S-20, PO-073), nella riga dei pulsanti piccoli della home.
// L'importazione passa da migra(): un file non valido mostra un avviso e non tocca niente; se c'è già una
// partita chiede due conferme prima di sostituirla.
import { Download, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Salvataggio } from '../../salvataggi/salvataggio.ts';
import { esporta, importa } from '../archivio.ts';
import { Icona } from '../icone.tsx';

export function PulsantiArchivio(p: { sal: Salvataggio | null; chiedi: (s: Salvataggio) => void; errore: (x: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const scelto = async (f: File | undefined) => {
    if (!f) return;
    try { p.chiedi(await importa(f)); } catch (e) { p.errore(`File non valido: ${(e as Error).message}. La partita non è cambiata.`); }
    if (file.current) file.current.value = '';
  };
  return (
    <>
      {p.sal && <button type="button" className="pulsante piccolo" data-azione="esporta" onClick={() => esporta(p.sal!)}><Icona di={Download} />Esporta</button>}
      <button type="button" className="pulsante piccolo" data-azione="importa" onClick={() => file.current?.click()}><Icona di={Upload} />Importa</button>
      <input ref={file} type="file" accept="application/json,.json" hidden data-importa onChange={(e) => void scelto(e.target.files?.[0])} />
    </>
  );
}

/** Le due conferme prima di sostituire una partita esistente con quella del file; senza partita, subito. */
export function ConfermaImporta(p: { nuova: Salvataggio; esiste: boolean; fatto: (s: Salvataggio) => void; annulla: () => void }) {
  const [passo, setPasso] = useState(p.esiste ? 1 : 3);
  const { fatto, nuova } = p;
  useEffect(() => { if (passo >= 3) fatto(nuova); }, [passo, fatto, nuova]);
  if (passo >= 3) return null;
  return (
    <div className={`scheda conferma-importa${passo === 2 ? ' grave' : ''}`} data-conferma-importa={passo} role="alertdialog">
      <p>{passo === 1 ? 'Sostituire la partita sul telefono con quella del file?' : 'Sicuro? La partita che hai adesso sul telefono si perde.'}</p>
      <div className="secondari">
        <button type="button" className="pulsante piccolo" data-azione="no-importa" onClick={p.annulla}>No</button>
        <button type="button" className="pulsante piccolo" data-azione="si-importa" onClick={() => setPasso(passo + 1)}>{passo === 1 ? 'Sì' : 'Sì, sostituisci'}</button>
      </div>
    </div>
  );
}
