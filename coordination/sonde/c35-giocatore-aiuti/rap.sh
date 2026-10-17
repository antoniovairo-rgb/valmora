#!/bin/sh
S=/tmp/claude-0/-home-user-valmora/6de52252-8726-5993-b84c-2497c7cf11b3/scratchpad
$S/g.sh tocca s='[data-azione="rapporto"]' ms=1500 >/dev/null
$S/g.sh js c="(()=>{const v=document.querySelector('[data-tono]');const svg=v?.querySelector('[data-vignetta]');return 'tono '+(v?.dataset.tono)+' vignetta '+(svg?.dataset.vignetta)+(svg?.hasAttribute('data-nascosta')?' NASCOSTA':'')+'\n'+(document.querySelector('.scena')?.innerText.replace(/\n+/g,' / '))})()" | sed 's/^valore: //'
[ -n "$1" ] && $S/g.sh foto nome="$1" >/dev/null
