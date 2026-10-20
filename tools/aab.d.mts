export function codiceVersione(v: string | null | undefined): number | null;
export function controllaStoriaVersioni(sorgente: string | null): string[];
export const PERMESSI_AMMESSI: RegExp[];
export const PERMESSI_SEGNALATI: string[];
export function leggiManifest(xml: string): { versionCode: string | null; versionName: string | null; permessi: string[] };
export function controllaManifest(xml: string, versione: string): string[];
export function segnalazioniManifest(xml: string): string[];
export function controllaFileAab(percorso: string): string[];
export function bracciRossi(): string[];
