// Validatore dei dati: prima la struttura (schema/), poi il significato. Puro.
import { validaStruttura } from './schemi.ts';
import { validaSemantica } from './semantica.ts';
import { controllaImprevisti, innesta } from './imprevisti.ts';

export function validaDati(schemi: Record<string, object>, file: Record<string, unknown>): string[] {
  const struttura = validaStruttura(schemi, file);
  if (struttura.length) return struttura; // il significato si giudica solo su file ben formati
  if (!('stato.json' in file)) return ['stato.json: manca'];
  // PO-022: gli imprevisti si controllano sui file grezzi, poi le missioni innestate passano tutti i controlli delle chiamate
  return [...controllaImprevisti(file), ...validaSemantica(innesta(file))];
}
