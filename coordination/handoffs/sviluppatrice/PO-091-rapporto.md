# PO-091 – Stagione chiusa in città · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Difetto

Nelle stagioni 2 e 3, con gli episodi ancora chiusi, sotto la mappa c'era la riga «Tocca un episodio sulla mappa.»:
- non aveva senso, perché nessun episodio di quelle stagioni si può aprire;
- era impaginata fuori dallo stile delle schede.

## Cosa ho fatto (`src/resa/schermate/Citta.tsx`, `Invito`)

- **Stagione tutta chiusa**: una scheda come quella dell'episodio, con:
  - il titolo «Stagione N chiusa»;
  - il perché: «Si apre quando avrai superato tutti gli episodi della stagione M (e di quelle prima)»;
  - il tasto «Prossimo: episodio XX, titolo», che porta alla stagione e alla scheda di quell'episodio.
- Se l'ostacolo non è un episodio da superare ma la condizione della storia, la scheda dice «Si apre più avanti nella storia», senza inventare altro.
- **Stagione aperta senza episodio scelto**: la stessa scheda con «Tocca un episodio sulla mappa per vederlo e giocarlo.»
- **Rosso `__NO_C33C01`**: la riga di prima.

## Guardiano (`tools/foto-bozze.mjs`, inizio di `apriTutte`, 360×760)

Con un salvataggio senza episodi superati:
- la stagione 2 mostra la scheda che dice «chiusa» e «superato»;
- il tasto «Prossimo» porta alla scheda di e01.

## Misure

Rosso `C33C01` e verde: vedi il messaggio di consegna.
