# Scaletta della triade 2 (e37-e72) – BOZZA, PO-134

Stato: **proposta da far decidere al PO**, come l'indice della triade 1 (docs/INDICE_TRIADE.md, poi approvato con D-068).
Archi, personaggi e domande: docs/triade2/BIBBIA-T2.md. Nessun episodio giocabile prima del lancio (PO-134).

Regole tenute:
- 12 episodi per stagione, come la triade 1 (docs/BIBBIA.md, «Triadi di 3 stagioni × 12 missioni»).
- Ritmo D-092: mai più di 3 episodi «di stadio» di fila nella stessa stagione; «stadio» (S) = almeno due curve sulla
  mappa, «città» (C) = meno di due. La colonna «mappa» è una PROPOSTA: la misura vera la fa il guardiano
  src/dati/ritmo.ts sugli episodi scritti.
- Ogni indizio importante compare almeno due volte in episodi diversi (docs/BIBBIA.md, fatti dal pacchetto).
- Eventi di città dalla riserva docs/RISERVA_EVENTI.md (D-092); corteo degli studenti D-156; quartieri nuovi PO-110 con
  la regola D-124. Club solo quelli di D-125, salvo il club straniero inventato di S5 (domanda D-T2-03 e nota in fondo).
- Violenza solo nei rapporti radio e nei verbali; nessuna procedura di polizia reale.
- IPOTESI non misurata: difficoltà crescente fra S4, S5, S6 come D-162; si tara coi bot quando gli episodi esistono.

Legenda «scelta»: variabile di storia nuova proposta (nome provvisorio) o filo della triade 1 che torna.

## Stagione 4 «La città» (e37-e48) – grande evento: Capodanno in piazza (e48)

| ep | titolo | luogo | partita o evento | filo narrativo | scelta di storia | mappa |
|---|---|---|---|---|---|---|
| e37 | Di ruolo | Kiln, sala operativa | Kiln United–Pinegrove Rangers | raccordo coi tre esiti di e36; busta nuova di Malvasi, «doppio o niente» | — (legge l'esito di e36) | S |
| e38 | Il giovane | Skyfield | Skyfield Athletic–Garden Albion | arriva il vice-responsabile Ferraris; la direttrice Sarcone guarda i numeri | a Ferraris la curva ospiti o il piazzale (`fiducia_ferraris`) | S |
| e39 | Pioggia | Waterline, sottopassi | allerta maltempo, Waterline City–Lookout FC sospesa | prima giornata «di città»: deflusso sotto la pioggia | — | C |
| e40 | All'asta | centro, palazzo del comune | asta del cantiere sequestrato; partita solo alla radio | un consorzio senza volto fa un'offerta (1ª comparsa) | — | C |
| e41 | Il corteo degli studenti | strade fra Domepark e Skyfield | sciopero degli studenti che incrocia Skyfield–Domepark Villa (D-156) | la portavoce degli studenti; cassonetti e fumogeni solo alla radio | mediatore con gli studenti o con la curva (`studenti`) | C |
| e42 | Marblegate | Marblegate (nuovo, PO-110) | grande fiera in centro: folla, parcheggi, furti segnalati | il quartiere nuovo entra sulla mappa; volantini del consorzio | — | C |
| e43 | Al buio | Kiln | blackout durante Kiln United–Belltower Harriers (sera) | Ferraris tiene un settore da solo al buio | — | S |
| e44 | Treni fermi | stazione, Skyfield | sciopero dei trasporti; Skyfield–Railhead County, ospiti bloccati | i gemellati del Railhead restano in città con la curva Kiln | ospitarli in un posto solo o lasciarli in giro | S |
| e45 | L'ordigno | cantiere sequestrato | evacuazione del quartiere per un ordigno bellico ritrovato | il guardiano; il nome di Ottavio Marzanti sulle carte dell'asta (2ª comparsa del consorzio) | — | C |
| e46 | Pedali | Stoneway | gara ciclistica che chiude le strade; Stoneway Wanderers–Kiln United | — | — | S |
| e47 | Festa contro | Pinegrove | festa di quartiere che diventa protesta contro il progetto del consorzio | il comitato chiede al protagonista da che parte sta | col comitato o col comune (credito) | C |
| e48 | Capodanno in piazza | tutta la città | **grande evento**: Capodanno in piazza | Marzanti in piazza, stretta di mano davanti ai fotografi; Malvasi: «Primo anno di ruolo» | — | C |

Serie massima di episodi di stadio: 2 (e37-e38, e43-e44).

## Stagione 5 «Chi la vuole» (e49-e60) – grande evento: coppa internazionale inventata (e54 andata, e57 ritorno)

| ep | titolo | luogo | partita o evento | filo narrativo | scelta di storia | mappa |
|---|---|---|---|---|---|---|
| e49 | La pace comprata | Kiln | derby Kiln United–Skyfield Athletic | biglietti regalati dal consorzio alle due curve (1ª comparsa) | — | S |
| e50 | Trasferta offerta | Wallgate (fuori città) | Wallgate Rovers–Kiln United, pullman pagati dal consorzio | i biglietti regalati tornano (2ª) | scortare i pullman del consorzio o farli partire da soli | S |
| e51 | Il ragazzo delle sciarpe | Newmarket (nuovo, PO-110) | mercato di sciarpe false al centro commerciale | l'informatore della triade 1 sa chi paga | coprirlo o no (`informatore_coperto`) | C |
| e52 | Runway | Runway (nuovo, PO-110) | arrivo della delegazione del club straniero; visita di una celebrità inventata | fan, fotografi, transenne; Marzanti accoglie gli ospiti | — | C |
| e53 | Lettera dal carcere | Studio | Studio Town–Kiln United | Ferrigno scrive al protagonista; tono secondo il filo della triade 1 (finale.json:8-10) | rispondere o no | S |
| e54 | Coppa, andata | Skyfield | **grande evento**: Skyfield Athletic–club straniero inventato | ospiti da un altro paese: lingua, treni, città | — | S |
| e55 | Il consulente | Belltower | Belltower Harriers–Tramway Borough (derby del capolinea) | torna Tavanti, consulente del comune: confronto a parole | — | S |
| e56 | Fumo sul porto | banchine del porto fluviale | incendio in un magazzino del porto, fumo sulla città | nel magazzino casse di sciarpe e biglietti (3ª) | — | C |
| e57 | Coppa, ritorno | stazione e Runway | partenza e ritorno della curva Skyfield per la partita all'estero | la partita si gioca lontano, il lavoro è in città | — | C |
| e58 | Vicini di casa | Waterline | Waterline City–Lookout FC | Ferraris sbaglia, Malvasi lo difende | — | S |
| e59 | La firma | palazzo del comune | firma fra consorzio e comune; corteo della curva Kiln contro | le prove dei biglietti regalati | darle a Sarcone o tenerle (`prove_consorzio`) | C |
| e60 | Il titolo | Domepark | Domepark Villa–Skyfield Athletic, ultima di campionato | fine stagione: il consorzio ha il cantiere | — | S |

Serie massima di episodi di stadio: 3 (e53-e55).

## Stagione 6 «Chi paga» (e61-e72) – grande evento: l'ultima partita nello stadio vecchio (e72)

| ep | titolo | luogo | partita o evento | filo narrativo | scelta di storia | mappa |
|---|---|---|---|---|---|---|
| e61 | Il processo | Garden | Garden Albion–Kiln United | il processo a Varrone, solo notizie; versione secondo il fascicolo di e31 (finale.json:26-29) | — | S |
| e62 | Il testimone | centro | la città nel giorno della deposizione (fuori campo) | torna il testimone della triade 1 (finale.json:12-14) | — | C |
| e63 | L'offerta | Square | Square Rovers–Skyfield Athletic | offrono a Malvasi un posto fuori città | — | S |
| e64 | Da solo | Pinegrove | Pinegrove Rangers–Kiln United | Ferraris guida la giornata, il protagonista coordina | lasciarlo sbagliare o intervenire | S |
| e65 | Watertower | Watertower (nuovo, PO-110) | maratona cittadina che attraversa i quartieri delle due tifoserie | — | — | C |
| e66 | La busta vecchia | Stoneway | Stoneway Wanderers–Domepark Villa | la busta della triade 1 (finale.json:16-18) collega Varrone a Marzanti | — | S |
| e67 | Demolire o restaurare | palazzo del comune | il consiglio comunale decide sullo stadio vecchio; curve unite in piazza | — | — | C |
| e68 | Marzanti | Arches | Arches Town–Studio Town | il consorzio cade o resta, secondo `prove_consorzio` e il fascicolo | — | S |
| e69 | Due città | Kiln e Marblegate | Kiln United–Belltower Harriers e un concerto a Marblegate, stessa sera | più responsabilità: due eventi da tenere insieme | — | S |
| e70 | Resta? | sala operativa, bar | nessuna partita: la notte della scelta di Malvasi | — | chiedergli di restare o lasciarlo andare (`malvasi_resta`) | C |
| e71 | Vigilia | tutta la città | notte prima dell'ultima nello stadio vecchio; tornano i gemellati del Railhead | — | — | C |
| e72 | L'ultima nello stadio vecchio | Kiln | **grande evento**: derby Kiln United–Skyfield Athletic | si apre la seconda busta; finale agrodolce, epico con ironia (D-099, D-165) | — | S |

Serie massima di episodi di stadio: 2 (e63-e64, e68-e69).

## Note
- Il club straniero di S5 non ha ancora un nome: aggiungerlo rompe la lista chiusa di D-125 (13 + 3); va al PO insieme
  a D-T2-03. Non verificato che un nome scelto non esista davvero: va controllato in rete.
- Le trasferte (e50, e57) seguono il precedente di e11 a Wallgate (docs/BIBBIA.md, «Club di fuori città»).
- Il Railhead County non gioca mai contro il Kiln (docs/BIBBIA.md, «Club di fuori città»): rispettato (e44 contro lo
  Skyfield, e71 solo ospite).
- Indizi con almeno due comparse: consorzio (e40, e45, e48), biglietti regalati (e49, e50, e56, e59), Marzanti (e45,
  e48, e52, e68).
