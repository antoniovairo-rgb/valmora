#!/bin/bash
# C-031: schermate a 412 e 1366×768 in parallelo (la 375 parte da coda-b).
cd /home/user/valmora
U=coordination/sonde/uscite-c31
(W=412 FOTO=1 node coordination/sonde/c29-schermate.mjs . docs/foto/c31/s412 $U/schermate-412.json > $U/schermate-412.log 2>&1; echo "schermate-412 $?" >> $U/coda-b.fine) &
(W=1366 H=768 node coordination/sonde/c29-schermate.mjs . docs/foto/c31/s1366 $U/schermate-1366.json > $U/schermate-1366.log 2>&1; echo "schermate-1366 $?" >> $U/coda-b.fine) &
(while kill -0 7694 2>/dev/null; do sleep 15; done; echo "schermate-375 fine (vedi log)" >> $U/coda-b.fine) &
wait
