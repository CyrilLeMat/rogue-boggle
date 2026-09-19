export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord = false;
}

export class Trie {
  root = new TrieNode();
  size = 0;

  insert(word: string) {
    let node = this.root;
    for (const letter of word) {
      let next = node.children.get(letter);
      if (!next) {
        next = new TrieNode();
        node.children.set(letter, next);
      }
      node = next;
    }
    if (!node.isWord) this.size++;
    node.isWord = true;
  }

  // Avance de plusieurs lettres d'un coup (case QU). null si le préfixe n'existe pas.
  walk(node: TrieNode, letters: string): TrieNode | null {
    let cur: TrieNode | undefined = node;
    for (const l of letters) {
      cur = cur.children.get(l);
      if (!cur) return null;
    }
    return cur;
  }

  has(word: string): boolean {
    const n = this.walk(this.root, word);
    return !!n && n.isWord;
  }
}
