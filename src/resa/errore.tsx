// Contenitore d'errore (S-22, C14-01): se un pezzo del gioco non si carica (per esempio un modulo che offline
// manca) non resta una pagina bianca ma un avviso con «Riprova». Rosso C14O03: nessun contenitore, come prima.
import { Component, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { spento } from '../interruttori.ts';
import { Icona } from './icone.tsx';

export class Contenitore extends Component<{ children: ReactNode }, { errore: string | null }> {
  state = { errore: null as string | null };
  static getDerivedStateFromError(e: Error) { return { errore: e.message }; }
  componentDidCatch(e: Error) { console.warn(`pezzo del gioco non caricato: ${e.message}`); }
  render() {
    if (this.state.errore === null || spento('C14O03')) return this.props.children;
    return (
      <div className="scheda errore-carica" role="alert" data-errore-carica>
        <h2>Qualcosa non si è caricato</h2>
        <p>Forse manca la rete. La partita è salvata: riprova, oppure riapri il gioco quando sei online.</p>
        <button className="pulsante" data-azione="riprova" onClick={() => location.reload()}><Icona di={RotateCcw} />Riprova</button>
      </div>
    );
  }
}
