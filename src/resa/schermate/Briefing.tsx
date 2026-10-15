// Briefing sulla mappa: le fonti arrivano una alla volta, una per passo (S-10); ognuna accende il suo settore
// (campo «settore» del briefing).
// Vero o falso si scopre solo nel verbale (D-024).
import { ChevronRight, Play } from 'lucide-react';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { Mittente } from './Fumetto.tsx';
import { aCascata, Passi } from './Passi.tsx';
import { Messaggio } from './Scena.tsx';
import { spento } from '../../interruttori.ts';
import { VignettaChiamata } from '../vignette-chiamata.tsx';

export function Briefing(p: { m: Missione; visti: number; vai: (visti: number) => void; inizia: () => void }) {
  const fonte = (b: Missione['briefing'][number], i: number, ultimo: boolean) => (
    <Messaggio key={i} classe={`radio${ultimo ? ' ultimo' : ''}`} dati={`fonte-${i + 1}`}>
      {/* D-126 b (C24-01): torna l'avatar; la vignetta a 42×42 non si leggeva. Rosso C63A01: la vignetta di D-118. */}
      <Mittente icona={iconaFonte(b.fonte)} nome={t(`fonte.${b.fonte}`)} etichetta={t(`affidabilita.${b.affidabilita}`)}
        figura={!spento('C63A01') ? undefined : <VignettaChiamata m={p.m} c={{ id: `briefing-${i + 1}`, fonte: b.fonte, settore: b.settore, testo: b.testo, opzioni: [] }} ritaglio="xMaxYMid slice" />} />
      <p className="testo-radio">{t(b.testo)}</p>
      {b.settore && <p className="tenue">Settore: {t(`settore.${b.settore}`)}</p>}
    </Messaggio>
  );
  const inizia = <button className="pulsante" data-azione="inizia" onClick={p.inizia}><Icona di={Play} />Alla prima ondata</button>;
  // Rosso C12P01: le fonti si accumulano in colonna, come prima di S-10.
  if (aCascata()) {
    const fonti = p.m.briefing.slice(0, p.visti);
    return (
      <>
        {fonti.map((b, i) => fonte(b, i, i === fonti.length - 1))}
        {p.visti >= p.m.briefing.length ? inizia : <button className="pulsante" data-azione="prossimo" onClick={() => p.vai(p.visti + 1)}>Prossimo messaggio<Icona di={ChevronRight} /></button>}
      </>
    );
  }
  return <Passi nome="Briefing" passo={Math.max(0, p.visti - 1)} vai={(i) => p.vai(i + 1)} passi={p.m.briefing.map((b, i) => fonte(b, i, true))} fine={inizia} />;
}
