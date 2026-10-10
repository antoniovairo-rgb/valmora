# Fase 0 – Proposte del Team Leader al PO

Data: 2026-10-11. Due decisioni da prendere: tecnologia (F0-1) e schema dati (F0-2). Nulla qui è deciso.

## F0-1 · Tecnologia

Cosa c'è già sulla macchina: Node 24, npm 11, Java (OpenJDK 25), Python 3.12, Android SDK (platform-tools, build-tools, emulator). Non ci sono Flutter, Godot né Gradle globale.
Cosa usano già i tuoi repository: **Plinto** è React 18 + Vite + Vitest + Playwright con cartella `android/`; **Carrier-manager-** ha `capacitor.config.json`. Non ho letto il codice di build di Plinto in dettaglio: che Plinto usi Capacitor è un'ipotesi, da confermare.

| | A. Web + Capacitor (consigliata) | B. Godot 4 | C. Kotlin + Jetpack Compose |
|---|---|---|---|
| Stack | TypeScript, Vite, React (o Preact), Capacitor per l'APK/AAB | Motore di gioco, GDScript, export Android | App Android nativa |
| Contenuti come dati | JSON + JSON Schema, validati in Node | Risorse `.tres`/JSON, validazione da scrivere | JSON + kotlinx.serialization |
| Test automatici | Vitest (veloci, senza telefono); bot di partite in Node | GUT in modalità headless, meno diffuso | JUnit; test UI con emulatore |
| Prova di gioco (test-play) | Nel browser con Playwright, poi APK su telefono | Solo con editor o build | Solo emulatore o telefono |
| Lavoro con Claude Code | Molto adatto: tutto è testo, ciclo rapido | Scene `.tscn` modificabili a mano ma fragili; serve l'editor installato | Adatto, ma build Gradle lente e più punti di rottura |
| Esperienza del PO | Stessa filiera di Plinto e Carrier-manager | Nuova | Nuova |
| Rischi | Prestazioni WebView su telefoni vecchi se la mappa ha molte animazioni | Curva di apprendimento, strumenti agentici meno maturi | Tempi di sviluppo più lunghi, niente anteprima nel browser |

**Raccomandazione: A.** Il gioco è una plancia 2D a turni/ondate con molto testo: non serve un motore. Si riusano strumenti, flusso di rilascio e checklist Play già rodati su Plinto, e test-play può collaudare nel browser senza aspettare build Android. Rischio principale da misurare nella fetta verticale: fluidità della mappa su un telefono economico.

## F0-2 · Schema dati (bozza)

Formato: un file JSON per entità, in `data/`, validato con JSON Schema in `schema/`. Le condizioni sono oggetti JSON, non stringhe di codice, così il validatore e il controllo del grafo le capiscono.

```
data/
  stato.json            variabili narrative dichiarate (nome, tipo, valore iniziale)
  club/<id>.json        13 club inventati
  personaggi/<id>.json
  fili/<id>.json        fili narrativi e indizi
  missioni/<id>.json    una per episodio
  soprannomi.json
  testi/it/*.json       stringhe; testi/en/ in seguito
```

**Variabile di stato** (`stato.json`)
```json
{ "id": "dessi_latitante", "tipo": "bool", "iniziale": false, "descrizione": "Dessì è in fuga" }
```
Tipi ammessi: `bool`, `int` (con `min`/`max`), `enum` (con `valori`). Nessuna variabile si usa senza essere dichiarata.

**Condizione** (riusata ovunque)
```json
{ "tutte": [ { "var": "dessi_latitante", "uguale": true }, { "var": "tensione_curva_nord", "almeno": 3 } ] }
```
Operatori: `tutte`, `almeno_una`, `non`, `uguale`, `almeno`, `al_massimo`.

**Effetto**
```json
{ "imposta": "dessi_latitante", "valore": true }
{ "aggiungi": "fiducia_questore", "valore": -1 }
```
(Il nome del ruolo "questore" è solo un esempio di formato: i ruoli veri li dà la bibbia.)

**Missione** (`missioni/e20.json`, campi principali)
```json
{
  "id": "e20", "stagione": 2, "episodio": 20, "titolo": "testi:e20.titolo",
  "disponibile_se": { "tutte": [] },
  "briefing": [
    { "testo": "testi:e20.info1", "fonte": "informatore", "affidabilita": "bassa", "vera": false }
  ],
  "mappa": { "settori": ["curva_nord", "piazzale_est"], "risorse": { "squadre": 6, "steward": 10 } },
  "ondate": [
    { "n": 1, "eventi": [ { "id": "corteo", "settore": "piazzale_est", "se": {}, "pressione": 2 } ] }
  ],
  "esiti": [
    { "id": "contenuto", "se": { "var": "tensione_max", "al_massimo": 4 }, "effetti": [], "verbale": "testi:e20.verbale_ok" },
    { "id": "fuga_dessi", "se": {}, "effetti": [ { "imposta": "dessi_latitante", "valore": true } ], "verbale": "testi:e20.verbale_fuga" }
  ],
  "fili": ["dessi"]
}
```
Regola: l'ultimo esito ha condizione vuota, così una missione ha sempre un'uscita.

**Filo narrativo** (`fili/dessi.json`)
```json
{
  "id": "dessi",
  "tappe": [
    { "episodio": 20, "evento": "fuga", "garantita": true },
    { "episodio": 29, "evento": "cattura", "garantita": true,
      "forme": [ { "se": { "var": "pista_porto", "uguale": true }, "variante": "cattura_porto" },
                 { "se": {}, "variante": "cattura_soffiata" } ] }
  ],
  "indizi": [ { "id": "furgone_grigio", "compare_in": ["e14", "e17"] } ]
}
```
`forme` con ultima variante senza condizione = il filo prosegue anche se il giocatore ha perso un'occasione.

**Controlli automatici che lo schema rende possibili (Fase 2)**
- ogni `var` usata esiste in `stato.json`;
- ogni missione e ogni tappa garantita ha un'uscita senza condizione;
- ogni indizio `compare_in` almeno 2 episodi diversi;
- ogni missione è raggiungibile da e01; e20 ed e29 avvengono in tutti i percorsi simulati;
- ogni chiave `testi:` esiste in `testi/it/`;
- nessuna parola della lista vietata nei testi.

**Domande per il PO sullo schema**
1. Le risorse sulla mappa sono poche categorie fisse (es. squadre, steward) o cambiano per missione? Dipende dalla bibbia.
2. Il briefing deve rivelare dopo la missione quali informazioni erano false? (campo `vera` sopra)
3. I soprannomi cambiano in base agli esiti (servono condizioni) o seguono la trama in modo fisso?
