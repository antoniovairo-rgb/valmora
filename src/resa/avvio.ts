// Punto d'ingresso della resa. Per ora mostra solo nome e versione: le schermate di e01
// arrivano con la bibbia (D-012).
import { GAME_VERSION } from '../versione.ts';

const app = document.getElementById('app');
if (app) app.textContent = `Valmora – Cortina di fumo · ${GAME_VERSION}`;
