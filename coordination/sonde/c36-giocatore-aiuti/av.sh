#!/bin/sh
# av.sh <selettore> <max> <prefisso foto>: tocca finché il selettore c'è, stampa solo il testo nuovo
G=/tmp/claude-0/-home-user-valmora/1ab09a1e-ff1b-5166-9de3-59e0267168c2/scratchpad/g.sh; prima=/tmp/claude-0/-home-user-valmora/1ab09a1e-ff1b-5166-9de3-59e0267168c2/scratchpad/prima.txt
$G stato > $prima
for i in $(seq 1 $2); do
  grep -q "\[data-azione=$1\]" $prima || break
  $G tocca s="[data-azione=\"$1\"]" ms=900 > $prima.n
  [ -n "$3" ] && $G foto nome="$3-$i" >/dev/null
  echo "=== passo $i ($(grep '^scena' $prima.n))"; diff <(sed -n '/TESTO/,/SETTORI\|COMANDI/p' $prima) <(sed -n '/TESTO/,/SETTORI\|COMANDI/p' $prima.n) | grep '^>' | grep -v "SETTORI\|COMANDI"
  mv $prima.n $prima
done
sed -n '/COMANDI/,$p' $prima
