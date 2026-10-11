import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Build della resa (index.html → dist/) e test unitari (tests/**/*.test.ts) in un solo file.
export default defineConfig({
  plugins: [react()],
  base: './', // percorsi relativi: la build gira anche dentro Capacitor e da file
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
