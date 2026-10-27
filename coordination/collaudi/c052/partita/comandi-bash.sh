c() { curl -s localhost:8152 -d "$1"; }
pick() { c "tocca .opzione >> nth=$1" >/dev/null; c 'tocca [data-azione="conferma-risposta"]' >/dev/null; c 'tocca [data-azione="continua"]' | head -c 1700; echo; echo "[$(c misura | head -c 120)]"; }
rap() { c 'tocca [data-azione="rapporto"]' >/dev/null; c testo | tail -n +2 | head -c 1500; echo; }
nextw() { c 'tocca .scena [data-azione="avanti"]' >/dev/null; c misura | head -c 150; echo; c testo | tail -n +2 | head -c 600; echo; }
last() { n=$(c 'tocca .opzione >> nth=0' >/dev/null; curl -s localhost:8152 -d testo | grep -o '| [A-D] |' | wc -l); c 'tocca [data-azione="annulla-risposta"]' >/dev/null; pick $((n-1)); }
