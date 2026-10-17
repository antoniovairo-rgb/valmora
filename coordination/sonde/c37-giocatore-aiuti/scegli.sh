#!/bin/sh
# scegli.sh <opzione>: tocca, stampa la risposta INTANTO, continua, stampa la chiamata dopo
S=/tmp/claude-0/-home-user-valmora/eaf3fcf1-8caf-5196-a3fd-a8849641ebf4/scratchpad/gA
$S/g.sh tocca s="[data-opzione=\"$1\"]" ms=1500 >/dev/null
$S/g.sh js c="(()=>{const t=document.querySelector('main').innerText;const i=t.indexOf('v0.37.0');return t.slice(i+8).replace(/\n+/g,' / ')+' | fiducia '+(t.match(/FIDUCIA\s+(\S+)/)?.[1])})()" | sed 's/^valore: /RISPOSTA: /' | grep -v ^errori
$S/g.sh tocca s='[data-azione="continua"]' ms=1500 >/dev/null
$S/ch.sh | grep -v ^errori
