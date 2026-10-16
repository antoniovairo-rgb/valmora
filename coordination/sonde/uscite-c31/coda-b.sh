#!/bin/bash
cd /home/user/valmora
U=coordination/sonde/uscite-c31
for w in 360 375 412; do
  W=$w FOTO=1 node coordination/sonde/c29-schermate.mjs . docs/foto/c31/s$w $U/schermate-$w.json > $U/schermate-$w.log 2>&1; echo "schermate-$w $?" >> $U/coda-b.fine
done
W=1366 H=768 node coordination/sonde/c29-schermate.mjs . docs/foto/c31/s1366 $U/schermate-1366.json > $U/schermate-1366.log 2>&1; echo "schermate-1366 $?" >> $U/coda-b.fine
