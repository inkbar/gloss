/**
 * Renders /llms.txt: a plain index of the site for tools that read documentation, with the
 * reference pages taken from the same groups as the sidebar.
 */
import type { SidebarGroup } from './reference/generate.ts'
import type { JsonSchema } from './reference/render.ts'

const SITE = 'https://gloss-format.org/'

export function renderLlms(schema: JsonSchema, groups: SidebarGroup[]): string {
  const defs = (schema['$defs'] ?? {}) as Record<string, JsonSchema>
  const url = (path: string) => new URL(path, SITE).href
  const summary = (name: string) => {
    const text = defs[name]?.['description']
    if (typeof text !== 'string') throw new Error(`${name} has no description`)
    return /^.*?[.!?](?=\s|$)/s.exec(text)?.[0] ?? text
  }

  return [
    '# Gloss',
    '',
    '> An open JSON format for PDF annotations. A Gloss document lists the highlights, notes, shapes and redactions on one PDF, each with its page and position. Send it as `application/vnd.gloss.annotations+json` and validate it against the JSON Schema at https://gloss-format.org/schema/v1.json. The `gloss-format` npm package ships the schema, zod schemas and TypeScript types.',
    '',
    '## Docs',
    '',
    `- [Introduction](${url('')}): the format, its coordinates, versioning and where to get the schema.`,
    `- [Using Gloss in your schemas](${url('using-gloss/')}): refer to Gloss definitions by URL and require the fields your system needs.`,
    `- [Gloss and XFDF](${url('xfdf/')}): the Gloss type for each XFDF element and the Gloss field for each XFDF attribute.`,
    `- [JSON Schema](${url('schema/v1.json')}): every definition, as JSON Schema 2020-12.`,
    `- [Full text](${url('llms-full.txt')}): every page as Markdown in one file. Each page also has its own copy: add \`.md\` to its path, as in ${url('using-gloss.md')}.`,
    '',
    ...groups.flatMap((group) => [
      `## Reference: ${group.label}`,
      '',
      ...group.items.map(
        (item) => `- [${item.label}](${url(`${item.slug}/`)}): ${summary(item.label)}`
      ),
      '',
    ]),
  ].join('\n')
}
