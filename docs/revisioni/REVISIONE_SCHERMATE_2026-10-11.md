# Revisione di tutte le schermate (PO-053, 2026-10-11)

Build del ramo principale dopo 5df546d (comprende bilancio, colori e stemmi, città leggibile; NON ancora il wizard S-10
né la folla S-11 della sviluppatrice). Partita e01 completa col giocatore attento, a 360×760 e 412×830, sonda
`rev.mjs` (derivata da c06 della collaudatrice): per ogni scena scorrimento verticale/orizzontale, carattere minimo,
bersagli di tocco < 44 px, testi tagliati, sovrapposizioni fra testi. Foto in docs/revisioni/2026-10-11/.

## Scorrimento verticale (px oltre lo schermo; tra parentesi: scene con scorrimento / scene viste)

| schermata | 360×760 | 412×830 |
|---|---|---|
| titolo (home) | 122 (1/1) | 12 (1/1) |
| crediti | 1071 (1/1) | 907 (1/1) |
| genere | 0 | 0 |
| città | 0 | 0 |
| sala | 538 (1/1) | 426 (1/1) |
| briefing | 817 (4/4) | 700 (4/4) |
| schieramento | 0 (0/3) | 0 (0/3) |
| chiamata | 437 (13/13) | 289 (13/13) |
| risposta | 107 (13/13) | 41 (12/13) |
| chiusura | 0 | 0 |
| rapporto | 188 (3/3) | 76 (3/3) |
| verbale | 1395 (1/1) | 1218 (1/1) |

Sempre a posto: scorrimento orizzontale 0, carattere minimo 12 px, nessun bersaglio di tocco sotto 44 px, nessun testo tagliato.

## Rilievi (FATTO MISURATO salvo dove scritto)
1. **Scorrimento** su sala, briefing, chiamata, risposta, rapporto, verbale, crediti, home a 360: è PO-052. Il wizard S-10 (un passo per schermata) deve portarle a 0 a 360×760, 412×830, 412×915.
2. **Il pulsante «Rispondi ↓» / «Ascolta le fonti» / «Prossimo messaggio» copre il testo**: è fisso in basso (C09-03) e, finché la schermata scorre, sta sopra il commento del vice o la fonte (es. chiamata 360: 5.726 px² sopra il commento del vice; sala: 9.752 px² sopra il primo fumetto). Sparisce con lo scorrimento a 0; fino ad allora va lasciato uno spazio sotto l'ultimo testo.
3. **Schieramento e01: «Curva Cinderwick» e «Strada da Cinderwick» impilate** a sinistra, e il segnalino «2» tocca il nome della curva (235 px² a 360). Già segnalato dalla sviluppatrice come «sotto i 6 px di distacco»: il PO chiede di rivedere, quindi va risolto (posizione del nome o dei punti).
4. **Rapporto: «Prossima ondata» copre l'ultima riga dei settori e «Disponibili nella prossima ondata»** (fino a 9.126 px² a 412) — stesso caso del punto 2.
5. **Home a 360: 122 px di scorrimento** dopo l'aggiunta di «Sostieni il progetto» (PO-050): pulsanti secondari (Crediti, Sostieni, Idee) più compatti, ad esempio su una riga di icone con etichetta.
6. Falso allarme scartato: «Verbale» × «Contenuto a fatica» nella testata (197 px²) è solo la riga dell'etichetta sopra il titolo, a occhio corretta.

## Assegnazione
Sviluppatrice, dentro S-10: punti 1, 2, 4, 5 con il controllo «eccedenza = 0» in foto.mjs; punto 3 con il posizionatore delle etichette. Dopo S-10 si rifà questa revisione con la stessa sonda e si confrontano le tabelle.
