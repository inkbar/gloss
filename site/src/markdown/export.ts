/**
 * Turns a docs page's source into plain Markdown for /<page>.md and /llms-full.txt: samples
 * inlined, components written out as Markdown, and relative links made absolute.
 */
import { plainText, QUESTIONS, VALIDATION_STEPS } from '../answers.ts'

export interface PageSource {
  title: string
  description?: string
  /** The page body, without frontmatter. */
  body: string
}

export interface ExportContext {
  /** The page's own URL, which relative links resolve against. */
  url: string
  /** Reads an imported sample, given the path the page imports it by. */
  readSample: (path: string) => string
}

const IMPORT = /^import\s+(\w+)\s+from\s+'([^']+)\?raw'\s*$/gm
const fence = (lang: string, code: string) =>
  `\`\`\`${lang}\n${code.replace(/\n$/, '')}\n\`\`\``

export function toMarkdown(page: PageSource, { url, readSample }: ExportContext): string {
  const samples = new Map<string, string>()
  for (const [, name, path] of page.body.matchAll(IMPORT))
    samples.set(name, readSample(path))
  const sample = (name: string) => {
    const text = samples.get(name)
    if (text === undefined)
      throw new Error(`${page.title}: no sample imported as ${name}`)
    return text
  }

  const body = page.body
    .replace(/^import .*$\n?/gm, '')
    .replace(
      /<Code\s+code=\{(\w+)\}\s+lang="(\w+)"\s+title="([^"]+)"\s*\/>/g,
      (_, name: string, lang: string, title: string) =>
        `${title}:\n\n${fence(lang, sample(name))}`
    )
    .replace(
      /<Glossed[\s\S]*?code=\{(\w+)\}[\s\S]*?title="([^"]+)"[\s\S]*?\/>/g,
      (_, name: string, title: string) => `${title}:\n\n${fence('json', sample(name))}`
    )
    .replace(/<Questions\s*\/>/g, () =>
      QUESTIONS.map(({ question, answer }) => `### ${question}\n\n${answer}`).join('\n\n')
    )
    .replace(/<ValidationSteps\s*\/>/g, () =>
      VALIDATION_STEPS.map((step, i) => `${i + 1}. ${step}`).join('\n')
    )
    // The reference marks required fields with brackets drawn in CSS; in plain text, say it.
    .replace(
      /<span class="required">(.*?)<span class="sr-only">(.*?)<\/span><\/span>/g,
      '$1$2'
    )
    .replace(
      /^Required fields are bracketed\.$/m,
      'A field marked (required) must be present.'
    )
    .trim()

  const left = /<[A-Z]\w*[\s\S]*?\/>/.exec(body)
  if (left) throw new Error(`${page.title}: no Markdown for ${left[0].split(/\s/)[0]}`)

  const intro = page.description ? `\n\n> ${plainText(page.description)}` : ''
  return `# ${page.title}${intro}\n\n${absoluteLinks(body, url)}\n`
}

/** Makes relative Markdown links absolute, outside code fences. */
function absoluteLinks(markdown: string, url: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(
            /\]\((?![a-z]+:|#)([^)\s]+)\)/g,
            (_, href: string) => `](${new URL(href, url).href})`
          )
    )
    .join('')
}
