#!/bin/bash
# Coda C-031: rilievi aperti (C28-01/02/05/09/11, C29-02/06), stessi comandi del C-030.
set -u
cd /home/user/valmora
U=coordination/sonde/uscite-c31
node coordination/sonde/c29-versione.mjs . > $U/versione.log 2>&1; echo "versione $?" >> $U/coda-d.fine
W=360 EP=e17,e04 node coordination/sonde/c27-pixel.mjs . docs/foto/c31 $U/pixel-e17-e04.json > $U/pixel-e17-e04.log 2>&1; echo "pixel-e17-e04 $?" >> $U/coda-d.fine
for wh in 768x1024 1920x1080 1366x768; do W=${wh%x*} H=${wh#*x} EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs . docs/foto/c31/mouse $U/mouse-$wh.json > $U/mouse-$wh.log 2>&1; echo "mouse-$wh $?" >> $U/coda-d.fine; done
W=1366 H=768 EP=e01,e13,e19,e30 FOTO=0 node coordination/sonde/c28-tastiera.mjs . docs/foto/c31/tastiera $U/tastiera-1366.json > $U/tastiera-1366.log 2>&1; echo "tastiera $?" >> $U/coda-d.fine
node coordination/sonde/c29-stemmi.mjs . docs/foto/c31/stemmi $U/stemmi.json > $U/stemmi.log 2>&1; echo "stemmi $?" >> $U/coda-d.fine
W=360 H=760 node coordination/sonde/c28-grandi.mjs . docs/foto/c31/grandi $U/grandi-360.json > $U/grandi-360.log 2>&1; echo "grandi $?" >> $U/coda-d.fine
