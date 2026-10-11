/** WebGL c'è? Se manca (telefoni molto vecchi, browser senza GPU) la mappa resta solo HTML, senza errori. */
export function webglDisponibile(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch { return false; }
}
