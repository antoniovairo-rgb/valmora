#!/bin/sh
# g.sh op [chiave=valore …] → stampa testo e comandi
op=$1; shift; q=""; for a in "$@"; do q="$q&$(python3 -c "import sys,urllib.parse;k,v=sys.argv[1].split('=',1);print(k+'='+urllib.parse.quote(v))" "$a")"; done
curl -s "http://127.0.0.1:9333/$op?${q#&}" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for k in ('scena','tono','folla','errore','errori','foto','valore'):
  if k in d and d[k] is not None: print(k+':',d[k])
if 'testo' in d: print('--- TESTO ---'); print(d['testo'])
if d.get('settori'): print('--- SETTORI ---'); print('\n'.join(d['settori']))
if 'comandi' in d: print('--- COMANDI ---'); print('\n'.join(d['comandi']))
"
