#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/a78dc403-54c3-5e47-9dae-3e4853d7f472/scratchpad
$S/g.sh tocca s='[data-azione="rapporto"]' ms=1500 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-tono]');const svg=v?.querySelector('[data-vignetta]');return 'tono '+(v?.dataset.tono)+' vignetta '+(svg?.dataset.vignetta)+(svg?.hasAttribute('data-nascosta')?' NASCOSTA':'')+'\n'+(document.querySelector('.scena')?.innerText.replace(/\n+/g,' / '))})()" | sed 's/^valore: //'
[ -n "$1" ] && $S/g.sh foto nome="$1" >/dev/null
