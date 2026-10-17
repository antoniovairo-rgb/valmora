#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/1ab09a1e-ff1b-5166-9de3-59e0267168c2/scratchpad
$S/g.sh tocca s='[data-azione="avanti"]' ms=2000 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-vignetta^=esito]');return 'vignetta '+(v?.dataset.vignetta)+(v?.hasAttribute('data-nascosta')?' NASCOSTA':'')+' braccia '+[...(v?.querySelectorAll('[data-braccia]')??[])].map(b=>b.dataset.braccia)+' stelle '+document.querySelectorAll('[data-stella].piena, .stella.piena, [data-stelle]').length+'\n'+document.querySelector('.scena')?.innerText.replace(/\n+/g,' / ')})()" | sed 's/^valore: //'
$S/g.sh foto nome="$1-verbale" pieno=1 >/dev/null
timeout 100 bash $S/av.sh passo 5 "$1-verbale-p" | grep "^>" | grep -v INDIETRO
