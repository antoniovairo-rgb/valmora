# Sonde delle collaudatrici

Sono strumenti usa e getta dei collaudi C-0xx, fuori dalla CI e dalle catene. Fotografano il gioco com'era alla
versione del loro collaudo e non si aggiornano.

Le sonde scritte prima della 0.51.0 (fino a C-050) aspettano il vecchio flusso delle risposte, col conto alla
rovescia di PO-121. Dalla 0.51.0 (PO-148, D-236) la risposta vale solo dopo «Conferma». Chi ne riusa una deve
aggiungere il tocco su «Conferma» dopo la scelta, come fanno tools/foto.mjs e tools/sonda-altezze.mjs (D-240).
