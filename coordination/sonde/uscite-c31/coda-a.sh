#!/bin/bash
# Coda di misure C-031 (sola lettura). Ogni comando scrive il suo log; i codici d'uscita in coda-a.fine.
cd /home/user/valmora
U=coordination/sonde/uscite-c31
node tools/bot.mjs 1000 > $U/bot-1000.log 2>&1; echo "bot $?" >> $U/coda-a.fine
npx vitest run > $U/vitest.log 2>&1; echo "vitest $?" >> $U/coda-a.fine
npx tsc --noEmit -p . > $U/tipi.log 2>&1; echo "tsc $?" >> $U/coda-a.fine
