// Icone dell'interfaccia: solo lucide-react (ISC, vedi CREDITI.md). Nessun simbolo di polizie, club o
// luoghi reali (REGOLE_PLAY §3). Gli id vengono dai dati: un id sconosciuto ha l'icona generica.
import { Construction, FileText, Globe, HardHat, Handshake, MessageSquare, Phone, Radio, UserRound, Users, type LucideIcon } from 'lucide-react';

const RISORSE: Record<string, LucideIcon> = { squadre: Users, steward: HardHat, mediatore: Handshake, transenne: Construction };

// Fonte → icona per parola contenuta nell'id (centrale_radio, voci_in_rete, …).
const FONTI: [RegExp, LucideIcon][] = [
  [/radio/, Radio], [/rete|social/, Globe], [/telefon/, Phone], [/informatore/, UserRound], [/ufficio|verbale|rapporto/, FileText],
];

export const iconaRisorsa = (id: string): LucideIcon => RISORSE[id] ?? UserRound;
export const iconaFonte = (id: string): LucideIcon => FONTI.find(([re]) => re.test(id))?.[1] ?? MessageSquare;

export function Icona(p: { di: LucideIcon; etichetta?: string }) {
  const I = p.di;
  return <I className="icona" aria-hidden={p.etichetta ? undefined : true} aria-label={p.etichetta} strokeWidth={2} />;
}
