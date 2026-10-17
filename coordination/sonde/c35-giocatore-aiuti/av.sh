#!/bin/sh
# av.sh <selettore> <max> <prefisso foto>: tocca finché il selettore c'è, stampa solo il testo nuovo
G=/tmp/claude-0/-home-user-valmora/6de52252-8726-5993-b84c-2497c7cf11b3/scratchpad/g.sh; prima=/tmp/claude-0/-home-user-valmora/6de52252-8726-5993-b84c-2497c7cf11b3/scratchpad/prima.txt
$G stato > $prima
for i in $(seq 1 $2); do
  grep -q "\[data-azione=$1\]" $prima || break
  $G tocca s="[data-azione=\"$1\"]" ms=900 > $prima.n
  [ -n "$3" ] && $G foto nome="$3-$i" >/dev/null
  echo "=== passo $i ($(grep '^scena' $prima.n))"; diff <(sed -n '/TESTO/,/SETTORI\|COMANDI/p' $prima) <(sed -n '/TESTO/,/SETTORI\|COMANDI/p' $prima.n) | grep '^>' | grep -v "SETTORI\|COMANDI"
  mv $prima.n $prima
done
sed -n '/COMANDI/,$p' $prima
