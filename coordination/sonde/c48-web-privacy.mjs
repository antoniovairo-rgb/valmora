// C-048: pagina web della privacy a 360/375/412 (se la rete della sessione lo consente).
import { chromium } from 'playwright-core';
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined, args: ['--ignore-certificate-errors'] });
for (const [w, h] of [[360, 640], [375, 667], [412, 760]]) {
  const ctx = await br.newContext({ viewport: { width: w, height: h }, ignoreHTTPSErrors: true }), p = await ctx.newPage();
  try { const r = await p.goto('https://antoniovairo-rgb.github.io/valmora/privacy/', { timeout: 20000 }); await p.screenshot({ path: `coordination/handoffs/collaudo/c48/web-privacy-${w}x${h}.jpg`, type: 'jpeg', quality: 55, fullPage: true });
    console.log(w, h, r.status(), await p.evaluate(() => ({ orizz: document.documentElement.scrollWidth - innerWidth, chiocciola: document.body.innerText.includes('@'), paragrafi: document.querySelectorAll('[data-privacy-testo] p').length }))); } catch (e) { console.log(w, h, 'ERRORE', e.message.split('\n')[0]); }
  await ctx.close();
}
await br.close();
