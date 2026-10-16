set -o pipefail
W=1366 H=768 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-1366x768.json > coordination/sonde/uscite-c32/grandi-1366x768.log 2>&1; echo "grandi-1366 $?"
W=768 H=1024 TOCCO=1 FOTO=e01 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo-tocco coordination/sonde/uscite-c32/grandi-768x1024-tocco.json > coordination/sonde/uscite-c32/grandi-768x1024-tocco.log 2>&1; echo "grandi-768-tocco $?"
