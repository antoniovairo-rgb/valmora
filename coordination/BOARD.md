# Lavagna – Valmora

Scritta solo dalla sessione principale. Stati: da fare / in corso / in collaudo / da correggere / chiuso.
Ogni sessione parallela lavora sul suo ramo e consegna il rapporto in `coordination/handoffs/<ruolo>/`.
Solo la sessione principale integra e promuove su main (ISTRUZIONI_PO §9). Coordinamento dei rami: routine oraria alle :30 (AVVIO.md, D-058).

Ultimo giro della routine: nessuno ancora (primo previsto 2026-10-11 10:30 UTC).

## L1 – nuova e01 a scene (D-048…D-056)

| ID | Titolo | Resp. | Ramo | Criteri di accettazione | Dipende da | Stato |
|----|--------|-------|------|-------------------------|------------|-------|
| P-01 | Motore a scene (missione.ts), schema delle chiamate, bot v2 | principale | claude/valmora-l1-setup-schema-xdrbx7 | 0 blocchi su 1000 semi × 3 strategie; test verdi | – | chiuso |
| P-02 | Dati e testi di e01 v2: 3 ondate × 4-5 chiamate, il vice, briefing legato ai settori | principale | claude/valmora-l1-setup-schema-xdrbx7 | schema verde; bot: 0 blocchi, tre esiti raggiunti, le scelte cambiano l'esito | P-01 | chiuso (13 chiamate; campi nuovi: missione.introduzione, chiamata.commento, opzione.risposta, briefing.settore, settore.pos) |
| S-01 | Resa v2 «sala operativa»: mappa PixiJS, scene guidate, motion, icone, Crediti | sviluppatrice | claude/valmora-resa-v2 | vedi prompt in coordination/handoffs/sviluppatrice/S-01-prompt.md | P-01 | in corso |
| C-01 | Collaudo del motore a scene e dei dati di e01 v2 | collaudatrice | claude/valmora-collaudo | rapporti riproducibili in coordination/handoffs/collaudatrice/ | P-01 | in corso |
