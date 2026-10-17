#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/955726f2-49a9-50d3-b37e-9d621f3b12f3/scratchpad
$S/g.sh tocca s='[data-azione="avanti"]' ms=2000 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-vignetta^=esito]');return 'vignetta '+(v?.dataset.vignetta)+(v?.hasAttribute('data-nascosta')?' NASCOSTA':'')+' braccia '+[...(v?.querySelectorAll('[data-braccia]')??[])].map(b=>b.dataset.braccia)+' stelle '+document.querySelectorAll('[data-stella].piena, .stella.piena, [data-stelle]').length+'\n'+document.querySelector('.scena')?.innerText.replace(/\n+/g,' / ')})()" | sed 's/^valore: //'
$S/g.sh foto nome="$1-verbale" pieno=1 >/dev/null
timeout 100 bash $S/av.sh passo 5 "$1-verbale-p" | grep "^>" | grep -v INDIETRO
