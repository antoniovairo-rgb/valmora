# Avvio delle sessioni Vandel Falls (cloud)

Il progetto lavora in cloud (D-011) sul repository github.com/antoniovairo-rgb/valmora.

- Sessione principale: l'unica con cui parla il PO, su claude.ai/code sul repo valmora, ramo main.
- Sessioni parallele (collaudatrice, sviluppatrice, rilascio): le apre e le dirige la sessione principale, ognuna sul suo ramo, con un prompt autosufficiente (base, perimetro, cosa non toccare, formato del rapporto, commit e push dopo ogni consegna).
- Coordinamento: tramite rami su GitHub, docs/governo/ e coordination/handoffs/<ruolo>/.
- Routine oraria: controlla le sessioni e riprende quelle ferme con lavoro da fare.
- Ogni sessione, appena clonato il repo: `git config core.hooksPath .githooks` (PO-100, D-117: il pre-push ferma in 5 s i push che farebbero rossa la CI). Va scritto anche nel prompt di ogni sessione parallela.

Il pacchetto iniziale (docs/PROMPT_TEAM.md) descriveva 5 terminali locali con worktree: è superato da questo file e da docs/governo/ISTRUZIONI_PO.md §9.

## Routine di coordinamento (PO-028, D-058)

Ogni ora, alle :30, una Routine (trig_014gyKqgtK8rfyDmnGCjDWcZ) sveglia la sessione principale e la fa eseguire in quest'ordine:
1. **Rami:** `git fetch origin`; per la principale, la sviluppatrice (claude/valmora-resa-v2), la collaudatrice (claude/valmora-collaudo) e main: ultimo commit, se il ramo è avanti o indietro rispetto alla principale, esito della CI «catene».
2. **Allineamento:** un ramo parallelo indietro riceve l'ordine di fare merge (mai rebase) dalla principale; una CI rossa riceve l'ordine di riparazione, con il job rosso.
3. **Integrazione:** una consegna dichiarata pronta dalla sviluppatrice, con CI verde, entra nella principale (merge) e passa la catena completa 3 volte.
3b. **Rilascio (D-093, rivede D-079):** di notte, al giro delle 02:30 ora di Roma, se la principale ha novità rispetto a main: GAME_VERSION alzata con la sua riga di commento, catena completa 3/3 verde sulla build esatta (giri in sottofondo, attesa in primo piano), fast-forward su main, controllo che il link GitHub Pages mostri la nuova versione, push al PO. Di giorno niente main, salvo un difetto che blocca il collaudo del PO (dichiarato). A ogni rilascio, e a ogni domanda o blocco che richiede il PO, notifica push (D-080).
4. **Collaudo:** ogni rilievo della collaudatrice si riproduce prima di accettarlo (COLLAUDI.md: RIPRODOTTO o NON RIPRODOTTO).
5. **Sessioni:** una sessione ferma che ha ancora lavoro viene ripresa con il passo successivo.
6. **Registro:** lavagna aggiornata (riga «Ultimo giro della routine»). Al PO si scrivono solo i fatti nuovi.
