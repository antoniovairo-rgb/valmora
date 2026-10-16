#!/bin/bash
# Coda C-031: prima/dopo sui pixel (0.27.0 in un worktree a f4bc982), salvataggi veri della 0.27.0, ripresa R1/R2.
cd /home/user/valmora
U=coordination/sonde/uscite-c31
V027=/tmp/claude-0/-home-user-valmora/edac99bc-8120-5108-8d85-3f231b10c163/scratchpad/v027
while ! grep -q "^pixel " $U/coda-c.fine 2>/dev/null; do sleep 5; done
W=360 EP=e30,e21 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs $V027 /tmp/claude-0/-home-user-valmora/edac99bc-8120-5108-8d85-3f231b10c163/scratchpad/foto027 $U/pixel-e30-e21-027.json > $U/pixel-e30-e21-027.log 2>&1; echo "pixel027 $?" >> $U/coda-c.fine
EP=e02,e07,e13,e17,e21,e23,e24,e25,e27,e30,e31,e35 VA=0.27.0 VECCHI_DIR=coordination/sonde/salvataggi-025 node coordination/sonde/c28-salvataggi.mjs $V027 . coordination/sonde/salvataggi-027 $U/salvataggi.json > $U/salvataggi.log 2>&1; echo "salvataggi $?" >> $U/coda-c.fine
EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . $U/ripresa.json > $U/ripresa.log 2>&1; echo "ripresa $?" >> $U/coda-c.fine
