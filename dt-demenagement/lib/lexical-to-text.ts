// Extrait le texte brut d'un document Lexical (richText Payload CMS)
// Utilisé en attendant le rendu Lexical complet (Étape 29)

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

export function lexicalToText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  const root = (content as { root?: LexicalNode }).root
  if (!root) return ''

  function extractText(node: LexicalNode): string {
    if (node.text) return node.text
    if (!node.children?.length) return ''
    return node.children
      .map(extractText)
      .join(node.type === 'paragraph' || node.type === 'heading' ? ' ' : '')
  }

  return extractText(root).replace(/\s+/g, ' ').trim()
}
