// Interruttori rossi: ogni correzione si può spegnere con globalThis.__NO_XXX = true
// (nel browser globalThis è window), così il braccio rosso si misura anche nei test Node.

export function spento(nome: string): boolean {
  if (!/^[A-Z0-9_]+$/.test(nome)) throw new Error(`interruttore «${nome}»: solo maiuscole, cifre e _`);
  return Boolean((globalThis as Record<string, unknown>)[`__NO_${nome}`]);
}

export const acceso = (nome: string): boolean => !spento(nome);
