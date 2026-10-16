set -o pipefail
while pgrep -f coda-d.sh >/dev/null; do sleep 20; done
W=360 H=760 FOTO=1 node coordination/sonde/c29-schermate.mjs . docs/foto/c32/s360 coordination/sonde/uscite-c32/schermate-360.json > coordination/sonde/uscite-c32/schermate-360.log 2>&1; echo "schermate-360 $?"
W=375 H=667 node coordination/sonde/c29-schermate.mjs . docs/foto/c32/s375 coordination/sonde/uscite-c32/schermate-375.json > coordination/sonde/uscite-c32/schermate-375.log 2>&1; echo "schermate-375 $?"
W=412 H=915 node coordination/sonde/c29-schermate.mjs . docs/foto/c32/s412 coordination/sonde/uscite-c32/schermate-412.json > coordination/sonde/uscite-c32/schermate-412.log 2>&1; echo "schermate-412 $?"
W=1366 H=768 node coordination/sonde/c29-schermate.mjs . docs/foto/c32/s1366 coordination/sonde/uscite-c32/schermate-1366.json > coordination/sonde/uscite-c32/schermate-1366.log 2>&1; echo "schermate-1366 $?"
