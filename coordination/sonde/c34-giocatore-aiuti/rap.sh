#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/955726f2-49a9-50d3-b37e-9d621f3b12f3/scratchpad
$S/g.sh tocca s='[data-azione="rapporto"]' ms=1500 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-tono]');const svg=v?.querySelector('[data-vignetta]');return 'tono '+(v?.dataset.tono)+' vignetta '+(svg?.dataset.vignetta)+(svg?.hasAttribute('data-nascosta')?' NASCOSTA':'')+'\n'+(document.querySelector('.scena')?.innerText.replace(/\n+/g,' / '))})()" | sed 's/^valore: //'
[ -n "$1" ] && $S/g.sh foto nome="$1" >/dev/null
