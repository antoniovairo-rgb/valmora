#!/bin/sh
# metti.sh risorsa:settore:n …  (tocca l'unità, poi il disco del settore n volte)
G=/tmp/claude-0/-home-user-valmora/1ab09a1e-ff1b-5166-9de3-59e0267168c2/scratchpad/g.sh
for x in "$@"; do r=${x%%:*}; rest=${x#*:}; s=${rest%%:*}; n=${rest#*:}
  $G tocca s="[data-risorsa=\"$r\"]" ms=200 >/dev/null
  for i in $(seq 1 $n); do $G tocca s="[data-settore=\"$s\"] .settore-punto" ms=250 >/dev/null; done; done
$G stato | sed -n '/SETTORI/,$p' | grep -v "settore-punto\|tasto-home\|info\]"
