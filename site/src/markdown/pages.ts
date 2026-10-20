// Every docs page as Markdown, in reading order: the guides first, then the reference.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { getCollection } from 'astro:content'

import { toMarkdown } from './export.ts'

const SITE = 'https://gloss-format.org/'
const GUIDES = ['index', 'using-gloss', 'xfdf']

export async function markdownPages(): Promise<{ id: string; markdown: string }[]> {
  const entries = await getCollection('docs')
  const rank = (id: string) => (GUIDES.includes(id) ? GUIDES.indexOf(id) : GUIDES.length)
  entries.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))
  return entries.map((entry) => {
    // Astro builds from the site folder, and filePath is relative to it.
    const dir = dirname(join(process.cwd(), entry.filePath ?? ''))
    return {
      id: entry.id,
      markdown: toMarkdown(
        {
          title: entry.data.title,
          description: entry.data.description,
          body: entry.body ?? '',
        },
        {
          url: new URL(entry.id === 'index' ? '' : `${entry.id}/`, SITE).href,
          readSample: (path) => readFileSync(join(dir, path), 'utf8'),
        }
      ),
    }
  })
}
