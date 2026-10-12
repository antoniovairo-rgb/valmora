# Lavagna – Valmora

Scritta solo dalla sessione principale. Stati: da fare / in corso / in collaudo / da correggere / chiuso.
Ogni sessione parallela lavora sul suo ramo e consegna il rapporto in `coordination/handoffs/<ruolo>/`.
Solo la sessione principale integra e promuove su main (ISTRUZIONI_PO §9). Coordinamento dei rami: routine oraria alle :30 (AVVIO.md, D-058).

Ultimo giro della routine: 2026-10-12 17:30 UTC – principale 91c1bd8 completa VERDE: integrato S-23 secondo pezzo della sviluppatrice (vignette di sala e verbale, scorrimento zero a 760 px) + PO-083 (D-111). Pronta per il rilascio delle 23:00. Sviluppatrice: contrordine, prima S-26 poi S-25, poi C16-02/03/04/06 (descrizioni in docs/revisioni/COLLAUDO_C16.md sul ramo claude/valmora-collaudo-c16).

## L1 – nuova e01 a scene (D-048…D-056)

| ID | Titolo | Resp. | Ramo | Criteri di accettazione | Dipende da | Stato |
|----|--------|-------|------|-------------------------|------------|-------|
| P-01 | Motore a scene (missione.ts), schema delle chiamate, bot v2 | principale | claude/valmora-l1-setup-schema-xdrbx7 | 0 blocchi su 1000 semi × 3 strategie; test verdi | – | chiuso |
| P-02 | Dati e testi di e01 v2: 3 ondate × 4-5 chiamate, il vice, briefing legato ai settori | principale | claude/valmora-l1-setup-schema-xdrbx7 | schema verde; bot: 0 blocchi, tre esiti raggiunti, le scelte cambiano l'esito | P-01 | chiuso (13 chiamate; campi nuovi: missione.introduzione, chiamata.commento, opzione.risposta, briefing.settore, settore.pos) |
| S-01 | Resa v2 «sala operativa»: mappa PixiJS, scene guidate, motion, icone, Crediti | sviluppatrice | claude/valmora-resa-v2 | vedi prompt in coordination/handoffs/sviluppatrice/S-01-prompt.md | P-01 | in corso |
| S-02 | Mappa della città degli episodi, rigioco, stelle nel verbale, registro nel salvataggio (src/logica/episodi.ts) | sviluppatrice | claude/valmora-resa-v2 | episodio fallito → si rigioca; stelle a schermo; registro col migliore nel salvataggio v2; foto a 360/375/412 | S-01, PO-029 | da fare (dopo S-01) |
| S-03 | Restyling completo in stile C «graphic novel» con mappa aerea realistica e animazioni molto vive (D-066, D-067) | sviluppatrice | claude/valmora-resa-v2 | tutte le schermate in stile C; mappa = docs/stili/mappa-realistica.js portata in PixiJS; folla e corteo animati, unità che volano, transizioni; 0 errori, 0 scorrimento a 360/375/412; foto per il PO | S-01, PO-030 | da fare (PRIORITÀ: prima di S-02) |
| C-01 | Collaudo del motore a scene e dei dati di e01 v2 | collaudatrice | claude/valmora-collaudo | rapporti riproducibili in coordination/handoffs/collaudatrice/ | P-01 | chiuso (14 rilievi riprodotti: 13 corretti, B08 al PO; COLLAUDI C-002) |
