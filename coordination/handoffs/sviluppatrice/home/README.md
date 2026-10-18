# PO-140 · Home: tre direzioni (fase 1, SOLO PROPOSTE)

Sviluppatrice S-11, ramo `claude/valmora-home`, partito da `claude/valmora-l1-setup-schema-xdrbx7` (769f927).
Niente è entrato nel gioco: tutto sta in questa cartella. Le scelte sono del PO.

## Come sono fatte le foto
- Pagina di prova `proposte/index.html?v=A|B|C`, servita dal Vite del progetto, con gli asset veri: `src/resa/token.css`,
  `stile.css`, `stile-c18.css`, icona `public/icone/icona.svg`, `Vignetta` e `Persona` di `src/resa/vignetta.tsx`
  (protagonista e Malvasi della quarta prova approvata, D-171/D-176), colori dei club dai dati (D-086), testi veri dove
  esistono (`gioco.titolo`, `gioco.avviso`, `guida.titolo`, `e01.titolo`, la battuta di Malvasi da `data/testi/it/e01.json:16`).
- Comando: `node coordination/handoffs/sviluppatrice/home/proposte/foto.mjs` (Chromium, 360/375/412 × 760, scala 2,
  pagina intera). «Prima» = la home vera della build attuale con una partita salvata (si vede «Riprendi», come nella
  foto del PO). Le foto non sono del telefono: **Non verificato** sul dispositivo Android.
- Testi NUOVI (da approvare): frasi-obiettivo, didascalie, «Altro», premessa in due righe di C, testo della scheda di B.

## Foto
| | 360 | 375 | 412 |
|---|---|---|---|
| Prima (0.40.0) | prima-360.png | prima-375.png | prima-412.png |
| A · vignetta in testa | dopo-A-360.png | dopo-A-375.png | dopo-A-412.png |
| B · mappa della città | dopo-B-360.png | dopo-B-375.png | dopo-B-412.png |
| C · copertina | dopo-C-360.png | dopo-C-375.png | dopo-C-412.png |

## Misure (FATTO MISURATO, foto.mjs, finestra alta 760, 1 giro: è una misura di impaginazione, non rumorosa)
| | altezza pagina 360/375/412 | scorrimento a 360 | versione (x,y l×a) | sovrapposizioni versione (in cima / in fondo) |
|---|---|---|---|---|
| Prima | 760 / 760 / 760 | 0 px (metà bassa vuota: ultimo elemento a 595) | 0,697 16×55 | 0 / 0 |
| A | 778 / 768 / 789 | 18 px | 0,697 16×55 | 0 / 0 |
| B | 904 / 904 / 897 | 144 px | 0,697 16×55 | 0 / 0 |
| C | 801 / 810 / 831 | 41 px | 0,697 16×55 | 0 / 0 |
Errori di pagina: 0 in tutte le 12 foto. Larghezza = finestra in tutte (nessuno scorrimento orizzontale).

## A · Vignetta grande in testa (consigliata)
- Logo più compatto, vignetta 16:9 «Sala operativa · stasera si gioca»: tu e Malvasi davanti alla finestra della sala,
  fuori lo stadio di notte con i fari, le curve nei colori dei club e il fumo. Sotto, la frase-obiettivo in nastro
  nero: «Tieni la città calma nei giorni di partita.» e una riga su chi sei («responsabile ad interim… Malvasi
  scommette su quanto duri»). Poi Riprendi, Nuova partita, La città e il gioco + «Altro» (crediti, sostieni,
  esporta, importa, idee in un menu; il menu aperto non è fotografato).
- Coerenza nel resto dell'app: la stessa vignetta «sala + stadio» diventa la testata della città e della guida.
- Costi (IPOTESI): basso-medio; riusa Vignetta/Persona, serve un componente vignetta nuovo, il menu «Altro» (con i
  guardiani esistenti di esporta/importa/dona/idee da spostare dentro il menu) e le foto dei guardiani della home.
- Rischi a 360: la riga «La città e il gioco» + «Altro» è stretta (sta, misurato); la pagina scorre di 18 px a 760,
  sotto i 700 px di altezza la vignetta va rimpicciolita (useRiempi esiste già).
- Versione: resta verticale a sinistra nel margine di 16 px, leggibile, 0 sovrapposizioni.

## B · Mappa della città come fondo
- La metà alta è una mappa stilizzata: fonderie di Cinderwick col fumo, collina di Larkspire, fiume, viali, lo stadio
  della serata cerchiato in magenta con «Stasera: derby». Sotto, la scheda «Stasera · episodio 1 — Derby allo stadio:
  fonderie contro collina» col titolo vero dell'episodio, cosa fai e i busti dei due protagonisti; frase-obiettivo
  «Tieni Valmora calma, una partita alla volta.»
- Coerenza: la home diventa l'anticamera della città (stessa mappa, prossimo episodio): la città va ridisegnata nello
  stesso tratto, oppure la home usa la mappa realistica di D-067 (due stili di mappa da evitare).
- Costi (IPOTESI): i più alti: la scheda dipende dal salvataggio (prossimo episodio, stagione, episodio senza curve,
  finale), più casi da fotografare e da guardiare; testi «stasera» per ogni episodio.
- Rischi a 360: la pagina scorre di 144 px a 760 (i pulsanti principali restano dentro, l'avviso esce); le etichette
  sulla mappa possono coprirsi con nomi lunghi; leggibilità del testo sul fondo disegnato.
- Versione: leggibile, ma cade sopra il fondo della pagina vicino ai pulsanti quando si scorre (misurato 0 sovrapposizioni).

## C · Copertina da fumetto
- Una copertina: testata «N. 1 · Stagione 1 · Giorni di partita», titolone VALMORA, «Cortina di fumo» in magenta, la
  vignetta di sala e stadio, la premessa in due righe (da D-018: predecessore rimosso, nessuno voleva il posto, ora
  l'ordine pubblico nei giorni di partita è tuo, ad interim) e la nuvola di Malvasi con la battuta vera di e01:
  «Sei il quarto ad interim in due anni: ho una scommessa su quanto duri.»
- Coerenza: le altre schermate prendono la «testata da albo» (numero dell'episodio come numero dell'albo).
- Costi (IPOTESI): basso-medio, come A; il numero e la stagione in testata vanno tenuti allineati al salvataggio.
- Rischi a 360: è la più alta (scorre di 41 px), la premessa a 13 px è densa; manca la frase-obiettivo esplicita
  (l'obiettivo si capisce dalla premessa, non da un ordine).
- Versione: leggibile a sinistra, 0 sovrapposizioni.

## Preferenza della sviluppatrice (non è una decisione)
A: dice in un colpo d'occhio dove (sala, stadio, notte di partita), chi (tu e Malvasi) e cosa (frase-obiettivo),
scorre meno (18 px a 360), costa meno di B. Da C si può prendere la battuta di Malvasi come riga sotto la vignetta.

## Finzione e regole
Nessun club, luogo, persona o forza di polizia reale: Cinderwick, Larkspire e i club sono quelli di D-032/D-033.
Nessuna violenza in scena (fumo e fari, nessuno scontro). Colori, raggi e spaziature da token (proposte.css);
nella pagina di prova restano due spessori di tratto scritti a mano (mappa di B), da portare a token se B passa.
