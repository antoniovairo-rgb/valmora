// Interruttori rossi: ogni correzione si può spegnere con globalThis.__NO_XXX = true
// (nel browser globalThis è window), così il braccio rosso si misura anche nei test Node.

const validi = new Set<string>(); // PO-083: la regex a ogni chiamata pesava un ottavo del calcolo delle possibilità
export function spento(nome: string): boolean {
  if (!validi.has(nome)) { if (!/^[A-Z0-9_]+$/.test(nome)) throw new Error(`interruttore «${nome}»: solo maiuscole, cifre e _`); validi.add(nome); }
  return Boolean((globalThis as Record<string, unknown>)[`__NO_${nome}`]);
}

export const acceso = (nome: string): boolean => !spento(nome);
