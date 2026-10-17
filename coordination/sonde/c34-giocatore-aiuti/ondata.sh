#!/bin/sh
# ondata.sh <prefisso foto> <schieramento "r:s:n …"> <scelte "id=opzione …">: schiera, conferma, risponde alle chiamate
# conosciute (stampando chiamata e risposta come a schermo); alla prima chiamata non prevista si ferma e la stampa.
S=/tmp/claude-0/-home-user-valmora/955726f2-49a9-50d3-b37e-9d621f3b12f3/scratchpad; P=$1; SCH=$2; SCE=$3
if [ -n "$SCH" ]; then $S/metti.sh $SCH > /dev/null; $S/g.sh foto nome="$P-schierato" >/dev/null
  $S/g.sh tocca s='[data-azione="conferma"]' ms=600 >/dev/null; $S/g.sh tocca s='[data-azione="conferma-davvero"]' ms=1500 >/dev/null; fi
k=0
while :; do
  id=$($S/g.sh js c="document.querySelector('[data-messaggio^=chiamata-]:not(.risposta)')?.dataset.messaggio?.replace('chiamata-','') ?? document.querySelector('.scena')?.dataset.scena" | sed -n 's/^valore: //p' | tail -1)
  o=$(echo " $SCE " | tr ' ' '\n' | grep "^$id=" | cut -d= -f2)
  if [ -z "$o" ]; then echo "--- FERMO su: $id"; $S/ch.sh | grep -v "^errori"; break; fi
  k=$((k+1)); $S/ch.sh | grep -v "^errori\|^AZIONI\|^fiducia" | sed -n '2,$p' | head -2
  [ $k -eq 1 ] && $S/g.sh foto nome="$P-ch1" >/dev/null
  $S/sc.sh "$o" > $S/ris.txt; grep "risposta:\|^fiducia" $S/ris.txt | head -2 | sed 's/^/    /'
done
