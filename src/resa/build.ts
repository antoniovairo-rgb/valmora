// Identità della build (PO-032): commit corto e data, iniettati da vite.config (define __BUILD__).
// Fuori da Vite (test in node) il simbolo non esiste: typeof non lancia e si mostra «sviluppo».
declare const __BUILD__: string | undefined;
export const BUILD: string = typeof __BUILD__ === 'string' ? __BUILD__ : 'sviluppo';
