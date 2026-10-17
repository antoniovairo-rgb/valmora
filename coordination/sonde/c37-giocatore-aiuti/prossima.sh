#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/eaf3fcf1-8caf-5196-a3fd-a8849641ebf4/scratchpad/gC
$S/g.sh tocca s='[data-azione="avanti"]' ms=1500 > /dev/null
$S/g.sh js c="document.querySelector('.scena')?.dataset.scena+' | '+document.body.innerText.split('FIDUCIA')[0].replace(/\s+/g,' ')+' | FIDUCIA '+document.body.innerText.match(/FIDUCIA\s+(\S+)/)?.[1]" | sed 's/^valore: //'
$S/g.sh stato | sed -n '/SETTORI/,$p' | grep -v "settore-punto\|tasto-home\|azione=info\|aiuto\|azzera\|annulla"
[ -n "$1" ] && $S/g.sh foto nome="$1" >/dev/null
