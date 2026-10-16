set -o pipefail
while pgrep -f coda-c.sh >/dev/null; do sleep 20; done
EP=e01,e19 node coordination/sonde/c28-rotazione.mjs . docs/foto/c32/rotazione coordination/sonde/uscite-c32/rotazione.json > coordination/sonde/uscite-c32/rotazione.log 2>&1; echo "rotazione $?"
EP=e01 ROSSI=C86T01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c28-rotazione.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/rotazione-rosso-c86t01.json > coordination/sonde/uscite-c32/rotazione-rosso-c86t01.log 2>&1; echo "rotazione-rosso $?"
W=360 H=760 EP=e01,e13,e19,e30 ROSSI=C86T01 FOTO=e01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c28-grandi.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/grandi-360x760-rosso-c86t01.json > coordination/sonde/uscite-c32/grandi-360x760-rosso-c86t01.log 2>&1; echo "grandi-rosso $?"
node coordination/sonde/c29-stemmi.mjs . docs/foto/c32/stemmi coordination/sonde/uscite-c32/stemmi.json > coordination/sonde/uscite-c32/stemmi.log 2>&1; echo "stemmi $?"
ROSSI=C92P01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c29-stemmi.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/stemmi-rosso-c92p01.json > coordination/sonde/uscite-c32/stemmi-rosso-c92p01.log 2>&1; echo "stemmi-rosso-pigna $?"
ROSSI=C83S01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c29-stemmi.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/stemmi-rosso-c83s01.json > coordination/sonde/uscite-c32/stemmi-rosso-c83s01.log 2>&1; echo "stemmi-rosso-c83s01 $?"
