// Convertit un document Lexical (richText Payload CMS) en HTML sécurisé.
// Gère : paragraphes, texte formaté (gras/italique/souligné/barré/code),
//        listes ul/ol, liens, headings h2-h6, saut de ligne.
// Utilisable côté client (pas de dépendance serveur).

// Flags de format texte Lexical
const IS_BOLD        = 1
const IS_ITALIC      = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE   = 8
const IS_CODE        = 16

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface LexicalNode {
  type?:     string
  text?:     string
  format?:   number
  tag?:      string
  listType?: 'bullet' | 'number'
  url?:      string
  newTab?:   boolean
  children?: LexicalNode[]
}

function serializeNode(node: LexicalNode): string {
  switch (node.type) {

    case 'text': {
      let html = escapeHtml(node.text ?? '')
      const fmt = node.format ?? 0
      if (fmt & IS_CODE)          html = `<code>${html}</code>`
      if (fmt & IS_BOLD)          html = `<strong>${html}</strong>`
      if (fmt & IS_ITALIC)        html = `<em>${html}</em>`
      if (fmt & IS_UNDERLINE)     html = `<u>${html}</u>`
      if (fmt & IS_STRIKETHROUGH) html = `<s>${html}</s>`
      return html
    }

    case 'linebreak':
      return '<br />'

    case 'paragraph': {
      const inner = serializeChildren(node)
      if (!inner.trim()) return ''
      return `<p>${inner}</p>`
    }

    case 'heading': {
      const tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '') ? node.tag : 'h3') as string
      return `<${tag}>${serializeChildren(node)}</${tag}>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${serializeChildren(node)}</${tag}>`
    }

    case 'listitem':
      return `<li>${serializeChildren(node)}</li>`

    case 'link': {
      const href  = escapeHtml(node.url ?? '#')
      const attrs = node.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${attrs}>${serializeChildren(node)}</a>`
    }

    case 'quote':
      return `<blockquote>${serializeChildren(node)}</blockquote>`

    default:
      return serializeChildren(node)
  }
}

function serializeChildren(node: LexicalNode): string {
  return (node.children ?? []).map(serializeNode).join('')
}

export function lexicalToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as { root?: LexicalNode }).root
  if (!root) return ''
  return serializeChildren(root).trim()
}
