# S-20 – Esporta/importa la partita e copia di riserva (PO-073) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**. Lo scaricamento nell'app Android è **Non verificato** (vedi sotto).

## Cosa ho fatto

1. **Home, riga dei pulsanti piccoli** (`src/resa/schermate/Archivio.tsx`, `Titolo.tsx`):
   - «Esporta», solo se c'è una partita: scarica `valmora-AAAA-MM-GG.json` (un Blob con un link «download», nessuna dipendenza nuova);
   - «Importa»: legge un file e lo fa passare da `migra()`;
     - se il file non è valido: avviso «File non valido: … La partita non è cambiata.», e il salvataggio resta com'è;
     - se c'è già una partita: due conferme, «Sostituire la partita…?» e poi, in magenta, «Sicuro? La partita che hai adesso sul telefono si perde.», con «No» sempre a portata;
   - la riga va a capo su due righe (Crediti, Sostieni, Esporta / Importa, Idee). A 360, 375 e 412 × 760 la home con una partita salvata resta senza scorrimento (misura sotto).
2. **Copia di riserva** (`src/resa/archivio.ts`):
   - `salva()` scrive anche `valmora-salvataggio-riserva`;
   - se il principale è illeggibile, `carica()` usa la copia, riscrive il principale e la home lo dice: «Il salvataggio era rovinato: ho ripreso la partita dalla copia di riserva.»;
   - interruttore rosso `__NO_C19S01`: come prima, si riparte da capo.
3. **Guardiano** (`tools/foto-club.mjs` → `controllaArchivio`, a 360 px, dopo la partita):
   - esporta e controlla il nome del file;
   - ricarica pulita, importa: stesso salvataggio;
   - file rovinato: avviso, e il salvataggio non cambia;
   - importazione sopra una partita: prima e seconda conferma;
   - salvataggio principale rovinato: ripresa dalla copia, con avviso e «Riprendi».

**App Android, Non verificato:** non ho un dispositivo né un emulatore in questa sessione.
- La WebView di Capacitor potrebbe ignorare l'attributo `download` sui Blob (IPOTESI, non misurata).
- Se succede, serve un plugin per i file. Sarebbe una dipendenza nuova, quindi la decisione è del PO.
- Prova da fare sul telefono: Esporta, poi controllare se il file compare nei Download.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s20` | partita completa + archivio | verde |
| `… VALMORA_ROSSI=C19S01 …` | 360 px | ROSSO: «salvataggio rovinato senza ripresa dalla copia di riserva», «dopo la ripresa il salvataggio non è quello della copia» |
| `node tools/foto.mjs out/foto-s20` | 3 larghezze | verde |
| home con partita, `scrollHeight` a 360/375/412 × 760 | build bf80536 (prima) e build nuova (dopo) | 760 px in tutti e 6 i casi, nessuno scorrimento |
| `node tools/catena.mjs completa` | commit 35e2c3d (merge della principale 06128a0, 0.6.0), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s20/2026-10-12/`:
- home con partita, prima e dopo, a 360, 375 e 412 px;
- a 360 px: le due conferme dell'importazione e la ripresa dalla copia.

Nota del guardiano: la prima versione si interrompeva leggendo il salvataggio rovinato (`JSON.parse`). L'ho resa robusta.

Merge con la 0.6.0 della principale: `archivio.ts` era cambiato da entrambe le parti. Ho tenuto il suo `adattaAiDati` (salvataggi adattati ai dati nuovi, C-014) e lo applico anche alla copia di riserva e ai file importati.
