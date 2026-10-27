// Punto d'ingresso della resa. Font open source in locale (@fontsource, OFL 1.1): niente CDN, il gioco è offline.
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import { createRoot } from 'react-dom/client';
import './token.css';
import './stile.css';
import './stile-schermate.css';
import './stile-c18.css';
import './stile-home.css';
import { App } from './App.tsx';
import { Contenitore } from './errore.tsx';

createRoot(document.getElementById('app')!).render(<Contenitore><App /></Contenitore>);
