#!/bin/bash
# C-035 (copia di c34-schermate-blocchi.sh, uscite in uscite-c35): c29-schermate.mjs a blocchi di episodi (un container riavviato uccide le corse lunghe): un blocco per finestra,
# le 4 finestre in parallelo. Uso: bash coordination/sonde/c35-schermate-blocchi.sh <blocco 1-4> <cartella foto> [ROSSI]
set -o pipefail
B=$1; F=$2; R=$3; U=coordination/sonde/uscite-c35/schermate
EPS=(x "e01,e02,e03,e04,e05,e06,e07,e08,e09" "e10,e11,e12,e13,e14,e15,e16,e17,e18" "e19,e20,e21,e22,e23,e24,e25,e26,e27" "e28,e29,e30,e31,e32,e33,e34,e35,e36")
mkdir -p $U
for m in ${MISURE:-360x760 375x667 412x915 1366x768}; do W=${m%x*}; H=${m#*x}; mkdir -p $F/$m
  ( W=$W H=$H EP=${EPS[$B]} ROSSI=$R FOTO=${FOTO:-1} node coordination/sonde/c29-schermate.mjs . $F/$m $U/$m${R:+-$R}-b$B.json > $U/$m${R:+-$R}-b$B.log 2>&1; echo "fine $?" >> $U/$m${R:+-$R}-b$B.log ) &
done; wait
