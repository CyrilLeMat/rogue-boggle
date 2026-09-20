import { useEffect } from 'react';

// Chaque écran commence en haut. Sans ça, on arrive au milieu du suivant après avoir
// fait défiler le précédent — invisible sur un grand écran, systématique sur un téléphone.
export function useScrollTop(...deps: unknown[]) {
  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
