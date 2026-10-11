import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

// Identità della build mostrata nella home (PO-032): commit corto + data UTC. Così il PO sa quale build collauda.
function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim(); } catch { return 'sconosciuto'; }
}
const BUILD = `${commit()} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;

// Build della resa (index.html → dist/) e test unitari (tests/**/*.test.ts) in un solo file.
export default defineConfig({
  plugins: [react()],
  define: { __BUILD__: JSON.stringify(BUILD) },
  base: './', // percorsi relativi: la build gira anche dentro Capacitor e da file
  // Dati di gioco: data/. VALMORA_DATI punta a un'altra cartella SOLO per provare la resa con dati
  // di prova (tests/resa/dati-prova) in una build a parte; la catena usa sempre data/.
  resolve: { alias: { '@dati': resolve(process.env.VALMORA_DATI ?? 'data') } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
