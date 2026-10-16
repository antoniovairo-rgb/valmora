set -o pipefail
W=375 H=667 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-375x667.json > coordination/sonde/uscite-c32/grandi-375x667.log 2>&1; echo "grandi-375 $?"
W=412 H=915 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo coordination/sonde/uscite-c32/grandi-412x915.json > coordination/sonde/uscite-c32/grandi-412x915.log 2>&1; echo "grandi-412 $?"
W=360 H=760 EP=e01,e13,e19,e30 FOTO=e01,e13,e19,e30 node coordination/sonde/c28-grandi.mjs <scratchpad>/v028 docs/foto/c32/prima coordination/sonde/uscite-c32/grandi-028-360x760.json > coordination/sonde/uscite-c32/grandi-028-360x760.log 2>&1; echo "grandi-028-360 $?"
W=1024 H=768 EP=e01,e13,e19 FOTO=e01,e13,e19 node coordination/sonde/c28-grandi.mjs <scratchpad>/v028 docs/foto/c32/prima coordination/sonde/uscite-c32/grandi-028-1024x768.json > coordination/sonde/uscite-c32/grandi-028-1024x768.log 2>&1; echo "grandi-028-1024 $?"
