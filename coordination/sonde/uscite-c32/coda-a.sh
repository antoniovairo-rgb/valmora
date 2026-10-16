set -o pipefail
W=360 H=760 FOTO=e01,e13,e19,e30 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-360x760.json > coordination/sonde/uscite-c32/grandi-360x760.log 2>&1; echo "grandi-360 $?"
W=1024 H=768 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-1024x768.json > coordination/sonde/uscite-c32/grandi-1024x768.log 2>&1; echo "grandi-1024 $?"
