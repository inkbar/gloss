import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import {
  groupFor,
  renderDefinition,
  slugFor,
  type Group,
  type JsonSchema,
} from './render.ts'

export interface SidebarGroup {
  label: Group
  items: { label: string; slug: string }[]
}

const GROUPS: Group[] = ['Document', 'Annotation types', 'Shared shapes', 'Enums']

/**
 * Writes a Markdown page for every `$defs` entry of `schema` into `outDir`, emptying it first so
 * a removed definition leaves no page behind, and returns the sidebar groups for the pages.
 * Within a group, pages follow the order of `$defs`.
 */
export function generateReference(schema: JsonSchema, outDir: URL): SidebarGroup[] {
  const defs = (schema['$defs'] ?? {}) as Record<string, JsonSchema>
  // Render everything before touching the folder, so a missing description fails cleanly.
  const pages = Object.entries(defs).map(([name, def]) => ({
    name,
    slug: slugFor(name),
    group: groupFor(name, def),
    markdown: renderDefinition(name, def, defs),
  }))

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  for (const page of pages)
    writeFileSync(new URL(`${page.slug}.md`, outDir), page.markdown)

  return GROUPS.map((label) => ({
    label,
    items: pages
      .filter((page) => page.group === label)
      .map((page) => ({ label: page.name, slug: `reference/${page.slug}` })),
  })).filter((group) => group.items.length > 0)
}
