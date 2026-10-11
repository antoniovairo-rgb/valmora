// Validazione STRUTTURALE dei file di data/ contro gli schemi di schema/ (JSON Schema 2020-12, Ajv).
// Puro: riceve schemi e file già letti, non tocca il disco. Così gira in Node, nei test e nel browser.
import Ajv2020 from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';

/** Quale schema vale per quale percorso (relativo a data/). */
export const REGOLE_PERCORSI: { re: RegExp; schema: string; idDaFile: boolean }[] = [
  { re: /^stato\.json$/, schema: 'stato.schema.json', idDaFile: false },
  { re: /^soprannomi\.json$/, schema: 'soprannomi.schema.json', idDaFile: false },
  { re: /^club\/([a-z0-9_]+)\.json$/, schema: 'club.schema.json', idDaFile: true },
  { re: /^personaggi\/([a-z0-9_]+)\.json$/, schema: 'personaggio.schema.json', idDaFile: true },
  { re: /^fili\/([a-z0-9_]+)\.json$/, schema: 'filo.schema.json', idDaFile: true },
  { re: /^missioni\/([a-z0-9_]+)\.json$/, schema: 'missione.schema.json', idDaFile: true },
  { re: /^testi\/it\/([a-z0-9_]+)\.json$/, schema: 'testi.schema.json', idDaFile: false },
];

export const regolaPer = (percorso: string) => REGOLE_PERCORSI.find((r) => r.re.test(percorso));

/** Compila gli schemi; lancia un errore se uno schema è rotto. */
export function compilaSchemi(schemi: Record<string, object>): Map<string, ValidateFunction> {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  for (const s of Object.values(schemi)) ajv.addSchema(s);
  const out = new Map<string, ValidateFunction>();
  for (const nome of Object.keys(schemi)) {
    const f = ajv.getSchema(nome);
    if (!f) throw new Error(`schema ${nome}: $id diverso dal nome del file`);
    out.set(nome, f);
  }
  return out;
}

/** Problemi strutturali di tutti i file. */
export function validaStruttura(schemi: Record<string, object>, file: Record<string, unknown>): string[] {
  const validatori = compilaSchemi(schemi);
  const problemi: string[] = [];
  for (const [percorso, contenuto] of Object.entries(file)) {
    const regola = regolaPer(percorso);
    if (!regola) { problemi.push(`${percorso}: percorso non previsto dallo schema dei dati`); continue; }
    const valida = validatori.get(regola.schema);
    if (!valida) { problemi.push(`${percorso}: manca ${regola.schema}`); continue; }
    if (!valida(contenuto)) {
      for (const e of valida.errors ?? []) problemi.push(`${percorso}${e.instancePath || ''}: ${e.message ?? 'non valido'}`);
      continue;
    }
    if (regola.idDaFile) {
      const atteso = regola.re.exec(percorso)?.[1];
      const id = (contenuto as { id?: string }).id;
      if (id !== atteso) problemi.push(`${percorso}: id «${id}» diverso dal nome del file «${atteso}»`);
    }
  }
  return problemi;
}
