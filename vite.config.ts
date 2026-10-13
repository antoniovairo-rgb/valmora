import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// S-22 (C14-01): a fine build, dist/sw.js riceve l'elenco di TUTTI i file della build (anche i moduli caricati a
// richiesta) e una versione = impronta dell'elenco; così offline non manca niente e le cache vecchie si tolgono.
function precache() {
  return {
    name: 'valmora-precache',
    apply: 'build' as const,
    closeBundle() {
      const dist = resolve('dist');
      const tutti = (readdirSync(dist, { recursive: true, withFileTypes: true }) as import('node:fs').Dirent[])
        .filter((d) => d.isFile()).map((d) => `${d.parentPath}/${d.name}`.slice(dist.length + 1).replaceAll('\\', '/'))
        .filter((f) => f !== 'sw.js' && f !== 'index.html').sort();
      const versione = createHash('sha256').update(tutti.join('\n')).digest('hex').slice(0, 12);
      const sw = `${dist}/sw.js`;
      const testo = readFileSync(sw, 'utf8')
        .replace(/\/\*VERSIONE\*\/.*?\/\*VERSIONE\*\//, `'${versione}'`)
        .replace(/\/\*FILE\*\/.*?\/\*FILE\*\//, JSON.stringify(tutti.map((f) => `./${f}`)));
      writeFileSync(sw, testo);
    },
  };
}

// Identità della build mostrata nella home (PO-032): commit corto + data UTC. Così il PO sa quale build collauda.
function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim(); } catch { return 'sconosciuto'; }
}
const BUILD = `${commit()} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;

// Build della resa (index.html → dist/) e test unitari (tests/**/*.test.ts) in un solo file.
export default defineConfig({
  plugins: [react(), precache()],
  define: { __BUILD__: JSON.stringify(BUILD) },
  base: './', // percorsi relativi: la build gira anche dentro Capacitor e da file
  // Dati di gioco: data/. VALMORA_DATI punta a un'altra cartella SOLO per provare la resa con dati
  // di prova (tests/resa/dati-prova) in una build a parte; la catena usa sempre data/.
  resolve: { alias: { '@dati': resolve(process.env.VALMORA_DATI ?? 'data') } },
  // Tetto di tempo per test: le simulazioni di coerenza (PO-086, PO-095, C17-14) durano 2-4 s da sole e sotto carico
  // superavano i 5 s di base (misurato il 13/10: dopo-scelte 4,2 s). È il tempo concesso, non la soglia di un guardiano.
  test: { include: ['tests/**/*.test.ts'], environment: 'node', testTimeout: 60_000 },
});
