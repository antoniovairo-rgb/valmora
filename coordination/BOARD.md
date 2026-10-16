# Lavagna – Valmora

Scritta solo dalla sessione principale. Stati: da fare / in corso / in collaudo / da correggere / chiuso.
Ogni sessione parallela lavora sul suo ramo e consegna il rapporto in `coordination/handoffs/<ruolo>/`.
Solo la sessione principale integra e promuove su main (ISTRUZIONI_PO §9). Coordinamento dei rami: routine oraria alle :30 (AVVIO.md, D-058).

Ultimo giro della routine: 2026-10-16 14:05 Roma – main 0.30.0 (98f6109), uscita alle 14:00 (verifica 3/3 VERDE su c689735, CI verde): C31-01 guardiano e21 o3, C31-03 e35 «familiari». C-032 sulla 0.29.0 in corso, esteso alle due voci della 0.30.0 (nessun collaudo nuovo per una release di due righe). Sviluppatrice: C29-02/C29-04 in catena. PO-117 registrata (spunto corteo degli studenti per la triade successiva).
Sviluppatrice 14/10: strumento instabile del nome in città chiuso (C47N01/N02, f426019); PO-103 pallini (C48P01); D-119 nomi in città 0/36 a 360 e 375 (C48N01); C21-01 neutro grigio (C49C01) e club sull'evento (C49E01), 12a31b5 integrato in f775f33. Prossimo: C21-05/06, C21-04, C21-09, PO-078 A, spicchio PO-085.

## L1 – nuova e01 a scene (D-048…D-056)

| ID | Titolo | Resp. | Ramo | Criteri di accettazione | Dipende da | Stato |
|----|--------|-------|------|-------------------------|------------|-------|
| P-01 | Motore a scene (missione.ts), schema delle chiamate, bot v2 | principale | claude/valmora-l1-setup-schema-xdrbx7 | 0 blocchi su 1000 semi × 3 strategie; test verdi | – | chiuso |
| P-02 | Dati e testi di e01 v2: 3 ondate × 4-5 chiamate, il vice, briefing legato ai settori | principale | claude/valmora-l1-setup-schema-xdrbx7 | schema verde; bot: 0 blocchi, tre esiti raggiunti, le scelte cambiano l'esito | P-01 | chiuso (13 chiamate; campi nuovi: missione.introduzione, chiamata.commento, opzione.risposta, briefing.settore, settore.pos) |
| S-01 | Resa v2 «sala operativa»: mappa PixiJS, scene guidate, motion, icone, Crediti | sviluppatrice | claude/valmora-resa-v2 | vedi prompt in coordination/handoffs/sviluppatrice/S-01-prompt.md | P-01 | in corso |
| S-02 | Mappa della città degli episodi, rigioco, stelle nel verbale, registro nel salvataggio (src/logica/episodi.ts) | sviluppatrice | claude/valmora-resa-v2 | episodio fallito → si rigioca; stelle a schermo; registro col migliore nel salvataggio v2; foto a 360/375/412 | S-01, PO-029 | da fare (dopo S-01) |
| S-03 | Restyling completo in stile C «graphic novel» con mappa aerea realistica e animazioni molto vive (D-066, D-067) | sviluppatrice | claude/valmora-resa-v2 | tutte le schermate in stile C; mappa = docs/stili/mappa-realistica.js portata in PixiJS; folla e corteo animati, unità che volano, transizioni; 0 errori, 0 scorrimento a 360/375/412; foto per il PO | S-01, PO-030 | da fare (PRIORITÀ: prima di S-02) |
| C-01 | Collaudo del motore a scene e dei dati di e01 v2 | collaudatrice | claude/valmora-collaudo | rapporti riproducibili in coordination/handoffs/collaudatrice/ | P-01 | chiuso (14 rilievi riprodotti: 13 corretti, B08 al PO; COLLAUDI C-002) |
