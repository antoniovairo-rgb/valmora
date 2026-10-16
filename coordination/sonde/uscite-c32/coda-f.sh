set -o pipefail
while pgrep -f coda-b.sh >/dev/null; do sleep 20; done
W=1366 H=768 EP=e01,e13,e19,e30 node coordination/sonde/c28-tastiera.mjs . docs/foto/c32/tastiera coordination/sonde/uscite-c32/tastiera-1366x768.json > coordination/sonde/uscite-c32/tastiera-1366x768.log 2>&1; echo "tastiera-1366 $?"
W=1366 H=768 EP=e01,e13,e19,e30 ROSSI=C88F01,C89C01 FOTO=0 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c28-tastiera.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/tastiera-1366x768-rosso-c88f01-c89c01.json > coordination/sonde/uscite-c32/tastiera-1366x768-rosso.log 2>&1; echo "tastiera-rosso $?"
W=1024 H=768 EP=e01,e19 node coordination/sonde/c28-tastiera.mjs . docs/foto/c32/tastiera coordination/sonde/uscite-c32/tastiera-1024x768.json > coordination/sonde/uscite-c32/tastiera-1024x768.log 2>&1; echo "tastiera-1024 $?"
W=360 H=760 EP=e01,e19 node coordination/sonde/c28-tastiera.mjs . docs/foto/c32/tastiera coordination/sonde/uscite-c32/tastiera-360x760.json > coordination/sonde/uscite-c32/tastiera-360x760.log 2>&1; echo "tastiera-360 $?"
