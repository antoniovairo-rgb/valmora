#!/bin/sh
# sblocca.sh e02,e03,…: segna come concluse (1 stella, variabili invariate) le missioni saltate, nel salvataggio vero, e riprende
S=/tmp/claude-0/-home-user-valmora/6de52252-8726-5993-b84c-2497c7cf11b3/scratchpad
$S/g.sh js c="(()=>{const s=JSON.parse(localStorage.getItem('valmora-salvataggio'));for(const e of '$1'.split(',')){if(!s.missioni_concluse.includes(e))s.missioni_concluse.push(e);s.episodi[e]??={migliore:{esito:'contenuto_a_fatica',fallita:false,stelle:1},tentativi:0,variabili_prima:{...s.variabili},variabili_dopo:{...s.variabili}};}localStorage.setItem('valmora-salvataggio',JSON.stringify(s));location.reload();return s.missioni_concluse.join(',')})()"
sleep 2; $S/g.sh testo t="Riprendi" ms=1500 | grep "^scena"
