// Punto d'ingresso della resa.
import { createRoot } from 'react-dom/client';
import './token.css';
import './stile.css';
import { App } from './App.tsx';

createRoot(document.getElementById('app')!).render(<App />);
