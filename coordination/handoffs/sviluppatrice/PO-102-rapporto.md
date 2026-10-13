# PO-102 – colori dei cortei per strada · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## Difetto

- Da v0.14.0, e09: in briefing e nell'ondata 1, sulla Strada da Larkspire e in tangenziale i puntini hanno i colori della curva ospiti (Calderholt, verde e giallo).
- Il testo invece parla dei tifosi di casa che scendono a piedi dall'uscita di Larkspire.
- Causa (FATTO, dal codice): i colori dei cortei erano UNA coppia per tutta la mappa.
  - Prima il club veniva scelto in `disponi`: la curva «ospiti», altrimenti la prima curva.
  - Poi `coloriCorteo` ne ricavava i colori.
  - Tutti i cortei li usavano, senza distinguere la strada.

## Misura prima della correzione (FATTO MISURATO)

Comando: `node po102-misura.mjs`, nella cartella di lavoro della sessione. Usa `follaDellOndata` su ogni ondata dei 36 episodi.

| Cortei in strada (episodio × ondata × strada) | Numero |
|---|---|
| totale | 81 |
| colori di **un'altra squadra** rispetto a quella che i dati mettono lì | **28** |
| di chi siano **non si deduce dai dati** | 41 (27 oggi con i colori di una squadra, 14 già neutri perché senza curve) |
| giusti | 12 |

Chiamate su una strada (corteo della dinamica PO-089): 106 in tutto. 29 hanno i colori di un'altra squadra; in 66 i dati non dicono di chi è la folla.

I 28 cortei con la squadra sbagliata:
- strada_larkspire: e01 (ondate 1 e 3), e05, e09, e18, e20, e24, e32, e36 (ondate 1 e 4 ciascuno). Oggi hanno i colori ospiti o Cinderwick, ma il corteo è di Larkspire.
- strada_cinderwick: e08, e10, e12, e19 (ondate 1 e 4), e16 (ondate 1, 2 e 4), e29 (ondata 4). Oggi hanno i colori ospiti o Larkspire, ma il corteo è di Cinderwick.

## Criterio (dedotto dai dati, D-086)

Per ogni strada, in quest'ordine:
1. il club della strada nei dati (`settore.club`: lo schema lo permette per ogni settore; oggi nessuna strada lo ha);
2. altrimenti il club della curva con lo stesso nome nello stesso episodio (strada_larkspire → curva_larkspire). Sono gli stessi colori dei tifosi sugli spalti;
3. altrimenti colori neutri (`--mappa-corteo-1/2`), mai quelli dell'altra squadra.

## Settori da completare nei dati

Per queste strade i dati non dicono di chi è la folla: oggi hanno colori neutri. Tra parentesi le ondate con un corteo.

- e02 viale_stazione (3)
- e03 parcheggi (1)
- e04 strada_cinderwick (2), parcheggi (2): nessuna curva
- e06 viale_concerto (2)
- e07 parcheggi (1), strada_larkspire (2): in e07 non c'è curva_larkspire
- e09 tangenziale (2)
- e11 strada_cinderwick (1), viale_stazione (1): nessuna curva
- e13 viale_concerto (2), parcheggi (1)
- e15 viale_stazione (3)
- e17 strada_cinderwick (2), piazza_municipio (2): nessuna curva
- e23 casello (2)
- e26 parcheggi (2)
- e30 strada_cinderwick (3): nessuna curva
- e31 viale_stazione (2)
- e33 viale_stazione (2)
- e34 parcheggi (2)
- e35 corso_centro (1)

Basta aggiungere `"club": "<id del club>"` al settore nei dati: la mappa lo usa subito (passo 1 del criterio) e il guardiano lo controlla.

## Codice

- `src/resa/mappa/sfondo.ts`:
  - `disponi` calcola `tifosiViali`, il club di ogni strada secondo il criterio;
  - `disegnaSfondo` restituisce `coloriViali` (strada → coppia di colori) e `origineViali` (strada → primario del club, o «neutro»).
- `src/resa/mappa/StratoPixi.tsx`:
  - ogni corteo usa i colori della sua strada;
  - anche la dinamica di una chiamata su una strada (PO-089);
  - la mappa espone `data-colori-cortei`.
- **Rosso `__NO_C43C02`:** una coppia sola per tutte le strade (la curva ospiti), come prima.

## Guardiano

`controllaColoriCortei` (`tools/foto-c17.mjs`) gira in ogni ondata di ogni partita del giro foto. Per ogni strada confronta `data-colori-cortei` col club che i dati mettono lì, o con «neutro».

## Foto

In `po102/`: `prima-*` (rosso C43C02) e `dopo-*`, e09 briefing (passo 4, «A piedi dall'uscita di Larkspire») e ondata 1, a 360, 375 e 412.

- Dopo: la Strada da Larkspire è blu e bianca (Larkspire Athletic, come la curva Larkspire); la tangenziale è neutra.
- Prima: tutte e due verde e giallo (Calderholt, ospiti).

## Misure del guardiano (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso C43C02: scatta in ogni ondata delle partite del giro. Per esempio «e01 ondata 1: corteo di «strada_larkspire» coi colori «#ff6a13», i dati dicono «larkspire_athletic» (#2fa7ff)». Altri casi: e02 viale_stazione col verde Calderholt invece di neutro; e03 parcheggi coi colori del Quillhaven invece di neutro.
