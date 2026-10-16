set -o pipefail
while pgrep -f coda-a.sh >/dev/null; do sleep 20; done
for s in 768x1024 1024x768 1366x768 1920x1080; do W=${s%x*} H=${s#*x} EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs . docs/foto/c32/mouse coordination/sonde/uscite-c32/mouse-$s.json > coordination/sonde/uscite-c32/mouse-$s.log 2>&1; echo "mouse-$s $?"; done
W=1366 H=768 EP=e01,e13,e19 ROSSI=C87H01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c28-mouse.mjs . docs/foto/c32/rossi coordination/sonde/uscite-c32/mouse-1366x768-rosso-c87h01.json > coordination/sonde/uscite-c32/mouse-1366x768-rosso-c87h01.log 2>&1; echo "mouse-rosso $?"
W=360 H=760 EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs . docs/foto/c32/mouse coordination/sonde/uscite-c32/mouse-360x760.json > coordination/sonde/uscite-c32/mouse-360x760.log 2>&1; echo "mouse-360 $?"
