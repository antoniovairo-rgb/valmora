set -u
cd /home/user/valmora
for wh in 1366x768 360x700 360x760 393x740 412x740; do W=${wh%x*} H=${wh#*x} node coordination/sonde/c29-sala-tremolio.mjs . >> coordination/sonde/uscite-c30/sala-tremolio.log 2>&1; done
W=1366 H=768 ROSSI=C89V01 node coordination/sonde/c29-sala-tremolio.mjs . >> coordination/sonde/uscite-c30/sala-tremolio.log 2>&1
W=360 H=700 ROSSI=C89V01 node coordination/sonde/c29-sala-tremolio.mjs . >> coordination/sonde/uscite-c30/sala-tremolio.log 2>&1
W=1366 H=768 MOTO=reduce node coordination/sonde/c29-sala-tremolio.mjs . >> coordination/sonde/uscite-c30/sala-tremolio.log 2>&1
for wh in 1366x768 360x700; do W=${wh%x*} H=${wh#*x} N=30 node coordination/sonde/c29-sala-clic.mjs . >> coordination/sonde/uscite-c30/sala-clic.log 2>&1; W=${wh%x*} H=${wh#*x} N=30 ROSSI=C89V01 node coordination/sonde/c29-sala-clic.mjs . >> coordination/sonde/uscite-c30/sala-clic.log 2>&1; done
EP=e02,e07,e13,e17,e21,e23,e25,e27,e30,e31,e33,e35 VA=0.25.0 VECCHI_DIR=coordination/sonde/salvataggi-024 node coordination/sonde/c28-salvataggi.mjs /tmp/claude-0/v025 . coordination/sonde/salvataggi-025 coordination/sonde/uscite-c30/salvataggi.json > coordination/sonde/uscite-c30/salvataggi.log 2>&1
EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . coordination/sonde/uscite-c30/ripresa.json > coordination/sonde/uscite-c30/ripresa.log 2>&1
node coordination/sonde/c29-versione.mjs . > coordination/sonde/uscite-c30/versione.log 2>&1
W=360 EP=e17,e04 node coordination/sonde/c27-pixel.mjs . docs/foto/c30 coordination/sonde/uscite-c30/pixel-e17-e04.json > coordination/sonde/uscite-c30/pixel-e17-e04.log 2>&1
for wh in 768x1024 1920x1080 1366x768; do W=${wh%x*} H=${wh#*x} EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs . docs/foto/c30 coordination/sonde/uscite-c30/mouse-$wh.json > coordination/sonde/uscite-c30/mouse-$wh.log 2>&1; done
W=1366 H=768 EP=e01,e13,e19,e30 FOTO=0 node coordination/sonde/c28-tastiera.mjs . docs/foto/c30 coordination/sonde/uscite-c30/tastiera-1366.json > coordination/sonde/uscite-c30/tastiera-1366.log 2>&1
node coordination/sonde/c29-stemmi.mjs . docs/foto/c30/stemmi coordination/sonde/uscite-c30/stemmi.json > coordination/sonde/uscite-c30/stemmi.log 2>&1
echo FINE-CODA-A >> coordination/sonde/uscite-c30/coda-a.fine
