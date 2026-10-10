# Avvio della squadra Valmora

## Prima volta
1. Incolla la bibbia in `docs/BIBBIA.md` e committa (`git add docs/BIBBIA.md && git commit -m "Bibbia"`).
2. Rispondi alle decisioni in `docs/FASE0_PROPOSTA.md` (tecnologia e schema).
3. Solo dopo, apri le altre sessioni.

## Cinque terminali, tutti in questa cartella
```
claude                         # Team Leader (main)
claude --worktree dev-engine
claude --worktree dev-contenuti
claude --worktree test-auto
claude --worktree test-play
```
In ogni sessione incolla il prompt del ruolo da `docs/PROMPT_TEAM.md` (sezione 4).

## Farle lavorare senza riscrivere ogni volta
Le sessioni non si svegliano da sole quando cambia la lavagna. In ogni sessione non-Leader, dopo il prompt di ruolo:
```
/loop 20m aggiorna il branch con git merge main, leggi la lavagna da main e lavora sul prossimo compito assegnato al tuo ruolo; se non ce ne sono, fermati
```
Nel Leader:
```
/loop 30m leggi le consegne sui branch worktree-*, aggiorna coordination/BOARD.md, fai i merge ammessi e aggiorna coordination/REPORT.md
```
Le sessioni restano attive solo finché il PC è acceso e i terminali aperti.

## Correzioni rispetto al pacchetto originale
- I collaudatori non vedevano il codice da collaudare: ora fanno `git merge <branch-dev>` nel proprio branch (regola in CLAUDE.md).
- Nessuno svegliava le sessioni: aggiunto `/loop` qui sopra.
- Ogni ruolo fa `git merge main` all'inizio di ogni ciclo, per non lavorare su una base vecchia.
- I segreti sono bloccati anche in `.claude/settings.json` (regole `deny`), non solo a parole.
- Il report del PO ha un posto fisso: `coordination/REPORT.md`.
- La sessione "revisore" ha già la sua cartella in `coordination/handoffs/revisore/`; si avvia con `claude --worktree revisore`.
