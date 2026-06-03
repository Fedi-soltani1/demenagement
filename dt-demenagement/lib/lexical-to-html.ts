// Convertit un document Lexical (richText Payload CMS) en HTML sécurisé.
// Gère TOUS les formats de la barre d'outils :
//   texte : gras, italique, souligné, barré, code, exposant, indice
//   blocs : paragraphes, titres h1-h6, citation, ligne horizontale
//   listes : à puces, numérotées, à cocher
//   mise en page : alignement (gauche/centre/droite/justifié), indentation
//   liens (format Payload + format direct)
// Utilisable côté client (pas de dépendance serveur).

// Flags de format des nœuds TEXTE Lexical (bitmask)
const IS_BOLD          = 1
const IS_ITALIC        = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE     = 8
const IS_CODE          = 16
const IS_SUBSCRIPT     = 32
const IS_SUPERSCRIPT   = 64

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface LexicalLinkFields {
  url?:      string | null
  newTab?:   boolean | null
  linkType?: string | null
}

interface LexicalNode {
  type?:     string
  text?:     string
  // number sur les nœuds texte (bitmask), string (alignement) sur les nœuds bloc
  format?:   number | string
  tag?:      string
  listType?: 'bullet' | 'number' | 'check'
  checked?:  boolean
  indent?:   number
  url?:      string
  newTab?:   boolean
  fields?:   LexicalLinkFields   // les liens Payload stockent l'URL ici
  children?: LexicalNode[]
}

// Alignement (nœuds bloc : paragraphe, titre, liste…)
const ALIGN: Record<string, string> = {
  left: 'left', start: 'left', center: 'center', right: 'right', end: 'right', justify: 'justify',
}

// Construit l'attribut style (alignement + indentation) pour un nœud bloc
function blockStyle(node: LexicalNode): string {
  const styles: string[] = []
  if (typeof node.format === 'string' && ALIGN[node.format]) {
    styles.push(`text-align:${ALIGN[node.format]}`)
  }
  if (typeof node.indent === 'number' && node.indent > 0) {
    styles.push(`margin-inline-start:${node.indent * 1.5}rem`)
  }
  return styles.length ? ` style="${styles.join(';')}"` : ''
}

function serializeNode(node: LexicalNode): string {
  switch (node.type) {

    case 'text': {
      let html = escapeHtml(node.text ?? '')
      const fmt = typeof node.format === 'number' ? node.format : 0
      if (fmt & IS_CODE)          html = `<code>${html}</code>`
      if (fmt & IS_BOLD)          html = `<strong>${html}</strong>`
      if (fmt & IS_ITALIC)        html = `<em>${html}</em>`
      if (fmt & IS_UNDERLINE)     html = `<u>${html}</u>`
      if (fmt & IS_STRIKETHROUGH) html = `<s>${html}</s>`
      if (fmt & IS_SUBSCRIPT)     html = `<sub>${html}</sub>`
      if (fmt & IS_SUPERSCRIPT)   html = `<sup>${html}</sup>`
      return html
    }

    case 'linebreak':
      return '<br />'

    case 'horizontalrule':
      return '<hr />'

    case 'paragraph': {
      const inner = serializeChildren(node)
      if (!inner.trim()) return ''
      return `<p${blockStyle(node)}>${inner}</p>`
    }

    case 'heading': {
      const tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '') ? node.tag : 'h3') as string
      return `<${tag}${blockStyle(node)}>${serializeChildren(node)}</${tag}>`
    }

    case 'list': {
      if (node.listType === 'check') {
        return `<ul class="lex-checklist"${blockStyle(node)}>${serializeChildren(node)}</ul>`
      }
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}${blockStyle(node)}>${serializeChildren(node)}</${tag}>`
    }

    case 'listitem': {
      // Liste à cocher : afficher l'état coché/décoché
      if (typeof node.checked === 'boolean') {
        const cls = node.checked ? 'lex-check lex-check--done' : 'lex-check'
        return `<li class="${cls}">${serializeChildren(node)}</li>`
      }
      return `<li${blockStyle(node)}>${serializeChildren(node)}</li>`
    }

    case 'link':
    case 'autolink': {
      // Payload stocke l'URL dans fields.url ; fallback sur node.url
      const url    = node.fields?.url ?? node.url ?? '#'
      const newTab = node.fields?.newTab ?? node.newTab ?? false
      const href   = escapeHtml(url)
      const attrs  = newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${attrs}>${serializeChildren(node)}</a>`
    }

    case 'quote':
      return `<blockquote${blockStyle(node)}>${serializeChildren(node)}</blockquote>`

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
