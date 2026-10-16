set -o pipefail
W=360 EP=e04,e17 RIF=piazza_municipio ROSSI=C93V01 node coordination/sonde/c27-pixel.mjs <scratchpad>/v031 <scratchpad>/pixel-031r coordination/sonde/uscite-c32/v031/pixel-e04-e17-rosso-c93v01.json > coordination/sonde/uscite-c32/v031/pixel-e04-e17-rosso-c93v01.log 2>&1; echo "pixel-rosso $?"
W=360 H=760 FOTO=1 node coordination/sonde/c29-schermate.mjs <scratchpad>/v031 docs/foto/c32/v031/s360 coordination/sonde/uscite-c32/v031/schermate-360.json > coordination/sonde/uscite-c32/v031/schermate-360.log 2>&1; echo "schermate-360 $?"
