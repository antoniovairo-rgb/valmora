// Legge dal disco schema/*.json e data/**/*.json per il validatore (che è puro).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const elenca = (dir) => (existsSync(dir) ? readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith('.json'))
  .map((d) => join(d.parentPath, d.name)) : []);

const leggiJson = (p) => {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { throw new Error(`${p}: JSON non valido (${e.message})`); }
};

export function leggiSchemi(dir = 'schema') {
  return Object.fromEntries(elenca(dir).map((p) => [relative(dir, p).replaceAll('\\', '/'), leggiJson(p)]));
}

export function leggiDati(dir = 'data') {
  return Object.fromEntries(elenca(dir).map((p) => [relative(dir, p).replaceAll('\\', '/'), leggiJson(p)]));
}
