// PO-082: su Android senza richiesta del browser la home spiega come installare; nel browser interno di un'app
// (WhatsApp, Facebook) dice di aprire la pagina in Chrome.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserInterno, suAndroid } from '../src/resa/installa.ts';

const UA = {
  chrome: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  webview: 'Mozilla/5.0 (Linux; Android 14; SM-S911B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};
const conUA = (ua: string) => vi.stubGlobal('navigator', { userAgent: ua });

describe('installazione su Android (PO-082)', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('Chrome su Android: è Android, non è un browser interno', () => { conUA(UA.chrome); expect(suAndroid()).toBe(true); expect(browserInterno()).toBe(false); });
  it('browser interno di un\'app (WebView): va aperto in Chrome', () => { conUA(UA.webview); expect(suAndroid()).toBe(true); expect(browserInterno()).toBe(true); });
  it('iPhone: non è Android', () => { conUA(UA.iphone); expect(suAndroid()).toBe(false); });
});
