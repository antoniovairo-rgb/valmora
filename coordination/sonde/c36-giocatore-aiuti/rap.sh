#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/1ab09a1e-ff1b-5166-9de3-59e0267168c2/scratchpad
$S/g.sh tocca s='[data-azione="rapporto"]' ms=1500 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-tono]');const svg=v?.querySelector('[data-vignetta]');return 'tono '+(v?.dataset.tono)+' vignetta '+(svg?.dataset.vignetta)+(svg?.hasAttribute('data-nascosta')?' NASCOSTA':'')+'\n'+(document.querySelector('.scena')?.innerText.replace(/\n+/g,' / '))})()" | sed 's/^valore: //'
[ -n "$1" ] && $S/g.sh foto nome="$1" >/dev/null
