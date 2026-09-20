// Filet de sécurité : si un texte arrive à l'écran sans passer par say(),
// il reste un {jeton} visible. En développement, on le signale tout de suite.
const TOKEN = /\{[A-Za-z][A-Za-z0-9]*\}/g;

export function watchForRawTokens() {
  if (!import.meta.env.DEV || typeof document === 'undefined') return;
  const seen = new Set<string>();
  const scan = () => {
    const found = document.body.innerText.match(TOKEN);
    for (const t of found ?? []) {
      if (seen.has(t)) continue;
      seen.add(t);
      console.error(`[lexique] ${t} affiché tel quel : ce texte ne passe pas par say()`);
    }
  };
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true, characterData: true });
  scan();
}
