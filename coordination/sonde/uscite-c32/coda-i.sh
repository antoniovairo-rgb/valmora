set -o pipefail
while pgrep -f coda-e.sh >/dev/null; do sleep 20; done
node coordination/sonde/c29-pastiglie.mjs . coordination/sonde/uscite-c32/pastiglie.json docs/foto/c32/pastiglie > coordination/sonde/uscite-c32/pastiglie.log 2>&1; echo "pastiglie $?"
EP=e01,e04,e07,e08,e09,e13,e17,e19,e21,e25,e30,e33 VA=0.28.0 VECCHI_DIR=coordination/sonde/salvataggi-027 node coordination/sonde/c28-salvataggi.mjs <scratchpad>/v028 . coordination/sonde/salvataggi-028 coordination/sonde/uscite-c32/salvataggi.json > coordination/sonde/uscite-c32/salvataggi.log 2>&1; echo "salvataggi $?"
EP=e01,e07,e08,e17,e21,e30 node coordination/sonde/c25-ripresa.mjs . coordination/sonde/uscite-c32/ripresa.json > coordination/sonde/uscite-c32/ripresa.log 2>&1; echo "ripresa $?"
