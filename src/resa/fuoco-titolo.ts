// C34-01: quando si apre un riepilogo o una conferma il fuoco va sul suo titolo, e la pagina scorre fin lì; mai
// direttamente sul comando che conferma. Con C32-01 il fuoco perso andava al comando più vicino a «Conferma», cioè
// «Sì, conferma» del riepilogo (fuori dalla finestra a 1024 e 1366): un secondo Invio confermava senza aver visto il
// riepilogo. Lo stesso nelle conferme a più passi, dove il pulsante «Sì» resta lo stesso da un passo all'altro.
// Il titolo ha tabIndex -1 (non entra nel giro dei Tab). Rosso C104R01: il fuoco resta dov'è, come nella 0.34.0.
import { useEffect, type RefObject } from 'react';
import { spento } from '../interruttori.ts';

export function useFuocoTitolo(titolo: RefObject<HTMLElement | null>, chiave?: unknown) {
  useEffect(() => {
    const e = titolo.current;
    if (!e || spento('C104R01')) return;
    e.focus();
    e.scrollIntoView({ block: 'nearest' });
  }, [titolo, chiave]);
}
