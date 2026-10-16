#!/bin/bash
# Coda C-031: foto di e30 ed e21 a 360, 375, 412 (dopo: 0.28.0; prima: 0.27.0), movimento rispetto al municipio.
cd /home/user/valmora
U=coordination/sonde/uscite-c31
while ! grep -q "^ripresa " $U/coda-c.fine 2>/dev/null; do sleep 10; done
for w in 360 375 412; do
  W=$w FOTO=1 EP=e30,e21 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs . docs/foto/c31/dopo $U/pixel-foto-$w.json > $U/pixel-foto-$w.log 2>&1; echo "pixel-foto-$w $?" >> $U/coda-e.fine
  W=$w FOTO=1 EP=e30,e21 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs /tmp/claude-0/-home-user-valmora/edac99bc-8120-5108-8d85-3f231b10c163/scratchpad/v027 docs/foto/c31/prima $U/pixel-foto-027-$w.json > $U/pixel-foto-027-$w.log 2>&1; echo "pixel-foto-027-$w $?" >> $U/coda-e.fine
done
