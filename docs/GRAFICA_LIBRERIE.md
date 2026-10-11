# Librerie e asset open source per la grafica (PO-026)

Misure del 2026-10-11, fatte dalla sessione principale. Licenze e versioni prese da `npm view <pacchetto> version license`.
Peso = build Vite 8.3.4 di un esempio minimo (un rettangolo o un'animazione), JavaScript compresso con gzip -9.
Il peso vero dipenderà da cosa usiamo: queste sono misure di partenza, non di arrivo.

## Librerie (compatibili con React 19.3.0 già in uso)

| libreria | versione | licenza | peso minimo (gzip) | a cosa serve per Valmora |
|---|---|---|---|---|
| pixi.js + @pixi/react | 8.22.0 / 8.0.5 | MIT | 143 KB | mappa tattica in WebGL: tante figure animate (folla che si muove) anche su telefoni economici |
| konva + react-konva | 10.7.1 / 19.3.0 | MIT | 54 KB | mappa su canvas 2D con trascinamento già pronto; più leggera, meno adatta a centinaia di figure animate (IPOTESI, da misurare) |
| phaser | 4.2.1 | MIT | 343 KB | motore di gioco completo; si sovrappone a React e all'architettura (D-006), quindi sconsigliato |
| motion | 14.1.0 | MIT | 18 KB | transizioni fra le scene del wizard, entrate dei rapporti radio |
| lucide-react | 1.55.0 | ISC | non misurato | icone dell'interfaccia (pulsanti, radio, stato) |
| howler | 2.2.4 | MIT | non misurato | audio (radio, folla); ultima modifica su npm 2023-09-19 |

## Asset grafici gratuiti

| fonte | licenza | obblighi | fonte della licenza |
|---|---|---|---|
| Kenney (kenney.nl) | CC0 (pubblico dominio) | nessuno; il logo Kenney resta riservato | https://kenney.nl/support |
| game-icons.net | CC BY 3.0 | citare l'autore di ogni icona (schermata «Crediti») | https://game-icons.net/about.html |

Regole che restano valide (CLAUDE.md, REGOLE_PLAY): niente simboli di polizie, club o luoghi reali, anche presi da pacchetti gratuiti;
violenza fuori campo; ogni asset ha la sua licenza annotata in un file `CREDITI.md` prima di entrare nel gioco.
