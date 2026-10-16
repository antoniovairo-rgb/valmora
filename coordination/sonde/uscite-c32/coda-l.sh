set -o pipefail
W=360 EP=e01,e02,e03,e04,e05,e06,e07,e08,e09,e10,e11,e12,e13,e14,e15,e16,e17,e18,e19,e20,e21,e22,e23,e24,e25,e26,e27,e28,e29,e30,e31,e32,e33,e34,e35,e36 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs . docs/foto/c32/pixel-tutti coordination/sonde/uscite-c32/pixel-tutti-029.json > coordination/sonde/uscite-c32/pixel-tutti-029.log 2>&1; echo "pixel-tutti-029 $?"
