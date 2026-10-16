set -o pipefail
EP=e01,e04,e07,e08,e09,e13,e17,e19,e21,e25,e30,e33 VA=0.28.0 VECCHI_DIR=coordination/sonde/salvataggi-027 node coordination/sonde/c32-salvataggi.mjs <scratchpad>/v028 . coordination/sonde/salvataggi-028 coordination/sonde/uscite-c32/salvataggi-giro2.json > coordination/sonde/uscite-c32/salvataggi-giro2.log 2>&1; echo "salvataggi-giro2 $?"
