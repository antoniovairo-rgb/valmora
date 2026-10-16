set -o pipefail
while pgrep -f coda-f.sh >/dev/null; do sleep 20; done
W=360 EP=e30,e17,e04 RIF=piazza_municipio FOTO=1 node coordination/sonde/c27-pixel.mjs . docs/foto/c32/pixel coordination/sonde/uscite-c32/pixel-360.json > coordination/sonde/uscite-c32/pixel-360.log 2>&1; echo "pixel-360 $?"
W=412 EP=e30,e17,e04 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs . docs/foto/c32/pixel coordination/sonde/uscite-c32/pixel-412.json > coordination/sonde/uscite-c32/pixel-412.log 2>&1; echo "pixel-412 $?"
node tools/bot.mjs 1000 > coordination/sonde/uscite-c32/bot-1000.log 2>&1; echo "bot $?"
