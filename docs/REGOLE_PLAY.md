# Regole Google Play per Valmora

Riassunto di lavoro, letto il 2026-10-11. Le regole cambiano: prima di ogni rilascio si rilegge la pagina ufficiale e si aggiorna la data. Il testo che vale è quello delle pagine linkate, non questo riassunto.

Indice ufficiale: [Developer Policy Center](https://play.google/developer-content-policy/) · [Developer Program Policy](https://support.google.com/googleplay/android-developer/answer/17190352?hl=en)

## 1. Violenza
Fonte: [Inappropriate Content](https://support.google.com/googleplay/android-developer/answer/9878810?hl=en)
- La violenza di finzione in un contesto di gioco è in genere ammessa; sono vietate le rappresentazioni grafiche di violenza realistica e le minacce violente.
- Anche icona, immagini promozionali e video della scheda non devono mostrare violenza grafica in evidenza.
- Per Valmora: violenza fuori campo (rapporti, radio, verbali). Nessuna immagine di feriti o scontri nella scheda dello store.

## 2. Odio e gruppi
Fonte: [Inappropriate Content](https://support.google.com/googleplay/android-developer/answer/9878810?hl=en)
- Vietato promuovere violenza o odio contro gruppi in base a caratteristiche protette.
- Per Valmora: i gruppi ultras sono inventati e non legati a ideologie, etnie o religioni reali. Nessun simbolo estremista, nemmeno stilizzato. Cori e striscioni senza insulti discriminatori.

## 3. Imitazione
Fonte: [Impersonation](https://support.google.com/googleplay/android-developer/answer/9888374?hl=en)
- Vietato far credere che l'app sia legata o autorizzata da qualcuno che non lo è. Esempio citato dalla policy: usare un emblema nazionale per suggerire un'affiliazione governativa.
- Per Valmora: nessun nome, grado, stemma, divisa o logo di forze di polizia reali né di club, leghe o federazioni reali. Avviso di non affiliazione nell'app e nella scheda.

## 4. Eventi sensibili
Fonte: [Developer Program Policy](https://support.google.com/googleplay/android-developer/answer/17190352?hl=en) (sezione Sensitive Events)
- Vietato sfruttare o trattare con insensibilità eventi tragici reali.
- Per Valmora: nessuna missione ricalcata su scontri, morti o tragedie reali legate al calcio, anche con nomi cambiati.

## 5. Comportamento ingannevole
Fonte: [Deceptive Behavior](https://play.google.com/about/privacy-security-deception/deceptive-behavior/deceptive-settings/)
- Scheda dello store e app devono descrivere con onestà cosa fa il gioco.

## 6. Pubblico e classificazione
- Il gioco non è destinato ai bambini: non va iscritto al programma Families ([Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)).
- La classificazione arriva dal questionario IARC compilato dal PO. Il "16+" è un obiettivo, non un dato: "Non posso confermarlo" finché non c'è l'esito.

## Lista vietata (per il controllo automatico di test-auto)
Da completare in Fase 2: nomi di club e leghe reali, forze di polizia reali e loro reparti, nomi di persone reali, città reali usate come ambientazione. La lista sta in un file di dati (es. `data/lista-vietata.json`), non nel codice.
