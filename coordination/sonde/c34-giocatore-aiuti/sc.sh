#!/bin/sh
# sc.sh <opzione> <foto>: sceglie l'opzione, stampa la risposta, foto, «continua», stampa la chiamata dopo
S=/tmp/claude-0/-home-user-valmora/955726f2-49a9-50d3-b37e-9d621f3b12f3/scratchpad
$S/g.sh tocca s="[data-opzione=\"$1\"]" ms=1500 >/dev/null
$S/g.sh js c="[...document.querySelectorAll('[data-messaggio]')].slice(-2).map(x=>x.dataset.messaggio+': '+x.innerText.replace(/\s+/g,' ')).join('\n')+'\nfiducia '+(document.body.innerText.match(/FIDUCIA\s+(\S+)/)?.[1])" | sed 's/^valore: /RISPOSTA: /'
[ -n "$2" ] && $S/g.sh foto nome="$2" >/dev/null
$S/g.sh tocca s='[data-azione="continua"]' ms=1500 >/dev/null
echo; $S/ch.sh
