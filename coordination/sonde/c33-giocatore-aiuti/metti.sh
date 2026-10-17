#!/bin/sh
# metti.sh risorsa:settore:n …  (tocca l'unità, poi il disco del settore n volte)
G=/tmp/claude-0/-home-user-valmora/a78dc403-54c3-5e47-9dae-3e4853d7f472/scratchpad/g.sh
for x in "$@"; do r=${x%%:*}; rest=${x#*:}; s=${rest%%:*}; n=${rest#*:}
  $G tocca s="[data-risorsa=\"$r\"]" ms=200 >/dev/null
  for i in $(seq 1 $n); do $G tocca s="[data-settore=\"$s\"] .settore-punto" ms=250 >/dev/null; done; done
$G stato | sed -n '/SETTORI/,$p' | grep -v "settore-punto\|tasto-home\|info\]"
