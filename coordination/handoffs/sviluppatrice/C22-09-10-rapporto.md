# C22-09 (avatar uguale a chi chiama) e C22-10 (icone dei pulsanti a 20 px) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Foto in `c22-0910/`: `prima-*` (rossi C59A01 e C60I01) e `dopo-*`, e18 «telefonata» ed e01 «corteo_partito», a 360/375/412, pagina intera e corpo della chiamata. `conf-412-e18.png`: sopra prima, sotto dopo.

## C22-09 – avatar del mittente diverso da chi chiama

**Difetto (collaudo).** Due regole diverse:
- `icone.tsx` (avatar) dava l'icona generica in 222 chiamate su 498;
- `vignette-chiamata.tsx` (chi chiama) dava un'altra icona.
- Per esempio, in e18 «telefonata» l'avatar era un fumetto e accanto alla vignetta c'era un telefono.

**Correzione:**
- `iconaChi` (`vignette-chiamata.tsx`) dà la stessa icona per l'avatar della chiamata (`Ondata.tsx`) e per l'icona accanto alla vignetta (C22-01);
- per il vice resta la regola di prima.
- **Rosso `__NO_C59A01`:** l'avatar da `iconaFonte`, come prima.

**Guardiano** `controllaAvatarChi` (`tools/foto-c22.mjs`, da `controllaIconeEffetti`): il disegno SVG dell'avatar è identico a quello dell'icona accanto alla vignetta.

## C22-10 – icone dei pulsanti a 18 px

**Difetto (collaudo).** `--icona: 18px`, sotto i 20 dp minimi delle icone di Material.

**Correzione:**
- `--icona: 20px` (`token.css`);
- **Rosso `__NO_C60I01`:** classe CSS in `ROSSI_CSS`, `--icona: 18px`.

**Guardiano** `controllaIconePulsanti` (`tools/foto-c22.mjs`): ogni icona visibile nei pulsanti misura almeno 20×20 px a schermo. Pastiglie ed effetti hanno la loro misura (C22-05).

**Effetto collaterale trovato dal giro foto e corretto.**
- Il primo giro verde dava: «360px: schieramento: la versione copre conferma-davvero (PO-097)». Col rosso C60I01 il difetto non c'era: la causa sono le icone più larghe di 2 px.
- I due pulsanti del riepilogo («Torna allo schieramento», «Sì, conferma») non vanno a capo (`.azioni`, `stile.css:36`) e uscivano sotto la versione.
- Correzione (`stile-c18.css`): spazio fra icona e testo e margini laterali più stretti nei pulsanti del riepilogo, come già nei tre pulsanti dello schieramento (`.azioni.tre`, `stile.css:40`).

**Altezze** (sonda `altchiamate.mjs`, 142 chiamate, 360×760, rosso contro verde): differenza 0 px in tutte.

**Fonte.** Material 3, icone: https://m3.material.io/styles/icons/designing-icons. La misura dei 20 dp è quella citata dal collaudo; la pagina non l'ho riletta in questa sessione.

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Rossi insieme (`VALMORA_ROSSI=C59A01,C60I01`):
  - C22-09: 34 righe, per esempio «corteo_partito», «capo_curva»: «l'avatar del mittente ha un'icona diversa da quella di chi chiama»;
  - C22-10: 103 righe, per esempio «corteo_partito»: «3 icone di pulsanti sotto 20 px: 18.0×18.0».
- Verde dopo la correzione del riepilogo: exit 0 a 360 e exit 0 a 375 (`VALMORA_LARGHEZZE=375`).
