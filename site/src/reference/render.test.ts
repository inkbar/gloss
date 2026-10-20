import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

import {
  describeType,
  groupFor,
  renderDefinition,
  slugFor,
  type JsonSchema,
} from './render.ts'

const schema = createRequire(import.meta.url)('gloss-format/schema.json') as {
  $defs: Record<string, JsonSchema>
}
const defs = schema.$defs

/** The cells of the table row for `field`, without the leading and trailing pipes. */
function row(page: string, field: string): string[] {
  const line = page.split('\n').find((l) => l.startsWith(`| \`${field}\` |`))
  if (!line) throw new Error(`no row for ${field}`)
  return line
    .slice(2, -2)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())
}

describe('slugFor', () => {
  it.each([
    ['FreeTextStyle', 'free-text-style'],
    ['Rect', 'rect'],
    ['UnknownAnnotation', 'unknown-annotation'],
  ])('%s -> %s', (name, slug) => {
    expect(slugFor(name)).toBe(slug)
  })
})

describe('groupFor', () => {
  it('puts the document and the annotation unions in Document', () => {
    for (const name of ['Document', 'Annotation', 'UnknownAnnotation'])
      expect(groupFor(name, defs[name])).toBe('Document')
  })

  it('puts defs with a const type in Annotation types and the rest in Shared shapes', () => {
    expect(groupFor('Redact', defs['Redact'])).toBe('Annotation types')
    expect(groupFor('Common', defs['Common'])).toBe('Shared shapes')
    expect(groupFor('Rect', defs['Rect'])).toBe('Shared shapes')
  })
})

describe('describeType', () => {
  it('links a $ref relatively', () => {
    expect(describeType({ $ref: '#/$defs/Rect' }, 'note')).toBe('[Rect](../rect/)')
  })

  it('renders an array of refs', () => {
    expect(
      describeType({ type: 'array', items: { $ref: '#/$defs/Point' } }, 'line')
    ).toBe('[Point](../point/)[]')
  })

  it('lists constraints and keeps patterns in code spans', () => {
    expect(describeType(defs['Color'], 'color')).toBe(
      'string; matches `^#[0-9a-fA-F]{6}$`'
    )
    expect(describeType(defs['Dashes'], 'dashes')).toBe(
      'number[]; at least 1 item; each ≥ 0'
    )
  })

  it('leaves out the safe-integer bound zod adds', () => {
    const props = defs['Highlight']['properties'] as Record<string, JsonSchema>
    expect(describeType(props['page'], 'highlight')).toBe('integer; ≥ 0')
  })
})

describe('renderDefinition', () => {
  const note = renderDefinition('Note', defs['Note'])

  it('renders the frontmatter, the $ref and the XFDF element', () => {
    expect(note).toMatch(/^---\ntitle: Note\ndescription: ".+"\neditUrl: false\n---\n/)
    expect(note).toContain(
      '"$ref": "https://gloss-format.org/schema/v1.json#/$defs/Note"'
    )
    expect(note).toContain('XFDF element: `text`')
  })

  it('has a row per field with its default', () => {
    expect(note).toContain('| `icon` |')
    expect(row(note, 'icon')[3]).toContain('Note')
    expect(row(note, 'icon')[1]).toBe('[NoteIcon](../note-icon/)')
    expect(row(note, 'type')[2]).toBe('Yes')
  })

  it('escapes pipes in table cells', () => {
    const stamp = renderDefinition('Stamp', defs['Stamp'])
    expect(row(stamp, 'imagedata')[1]).toContain('`^data:image\\/(png\\|jpeg);base64,`')
  })

  it("lists the Annotation union's types", () => {
    const page = renderDefinition('Annotation', defs['Annotation'])
    expect(page.match(/^- \[\w+\]\(\.\.\/[\w-]+\/\)/gm)).toHaveLength(16)
  })

  it('lists the definitions that use it', () => {
    const page = renderDefinition('Rect', defs['Rect'], defs)
    expect(page).toContain('## Used by')
    expect(page).toContain('- [Redact](../redact/)')
  })

  it('throws when a field has no description', () => {
    const def = {
      description: 'A thing.',
      type: 'object',
      properties: { x: { type: 'number' } },
    }
    expect(() => renderDefinition('Thing', def)).toThrow('Thing.x has no description')
  })

  it('throws when a definition has no description', () => {
    expect(() => renderDefinition('Thing', { type: 'object' })).toThrow(
      'Thing has no description'
    )
  })
})
