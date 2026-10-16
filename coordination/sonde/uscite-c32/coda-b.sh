set -o pipefail
W=768 H=1024 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-768x1024.json > coordination/sonde/uscite-c32/grandi-768x1024.log 2>&1; echo "grandi-768 $?"
W=1920 H=1080 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-1920x1080.json > coordination/sonde/uscite-c32/grandi-1920x1080.log 2>&1; echo "grandi-1920 $?"
