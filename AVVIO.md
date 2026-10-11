# Avvio delle sessioni Valmora (cloud)

Il progetto lavora in cloud (D-011) sul repository github.com/antoniovairo-rgb/valmora.

- Sessione principale: l'unica con cui parla il PO, su claude.ai/code sul repo valmora, ramo main.
- Sessioni parallele (collaudatrice, sviluppatrice, rilascio): le apre e le dirige la sessione principale, ognuna sul suo ramo, con un prompt autosufficiente (base, perimetro, cosa non toccare, formato del rapporto, commit e push dopo ogni consegna).
- Coordinamento: tramite rami su GitHub, docs/governo/ e coordination/handoffs/<ruolo>/.
- Routine oraria: controlla le sessioni e riprende quelle ferme con lavoro da fare.

Il pacchetto iniziale (docs/PROMPT_TEAM.md) descriveva 5 terminali locali con worktree: è superato da questo file e da docs/governo/ISTRUZIONI_PO.md §9.
