import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { buildSchema } from './schema'

const schema = JSON.parse(
  readFileSync(new URL('../schema.json', import.meta.url), 'utf8')
) as Record<string, unknown>
const defs = schema.$defs as Record<string, Record<string, unknown>>

/** Calls `visit` on every object in `value`, depth first. */
function walk(value: unknown, visit: (node: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit)
  } else if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>
    visit(node)
    for (const child of Object.values(node)) walk(child, visit)
  }
}

describe('schema.json', () => {
  it('is exactly what the generator builds', () => {
    expect(schema).toEqual(buildSchema())
  })

  it('names every shared shape', () => {
    expect(Object.keys(defs)).toEqual(
      expect.arrayContaining([
        'Point',
        'Rect',
        'Quad',
        'Color',
        'Fringe',
        'Dashes',
        'LineEnding',
        'NoteIcon',
        'Intent',
        'Common',
      ])
    )
  })

  it('never closes an object', () => {
    walk(schema, (node) => {
      expect(node.additionalProperties).not.toBe(false)
      expect(node.unevaluatedProperties).not.toBe(false)
    })
  })

  it('describes every definition and property', () => {
    for (const [name, def] of Object.entries(defs)) {
      expect(def.description, name).toEqual(expect.stringMatching(/\S/))
      const properties = (def.properties ?? {}) as Record<string, Record<string, unknown>>
      for (const [key, prop] of Object.entries(properties)) {
        expect(prop.description, `${name}.${key}`).toEqual(expect.stringMatching(/\S/))
      }
    }
  })

  it('keeps the reference when a field is described', () => {
    const properties = defs.Common?.properties as Record<string, Record<string, unknown>>
    expect(properties.rect).toEqual({
      $ref: '#/$defs/Rect',
      description: expect.stringMatching(/\S/) as unknown,
      'x-xfdf': 'rect',
    })
  })

  it('carries XFDF names', () => {
    const properties = defs.Common?.properties as Record<string, Record<string, unknown>>
    expect(properties.page?.['x-xfdf']).toBe('page')
    expect(properties.author?.['x-xfdf']).toBe('title')
    expect(properties.createdAt?.['x-xfdf']).toBe('creationdate')
    expect(properties.modifiedAt?.['x-xfdf']).toBe('date')
    expect(properties.inReplyTo?.['x-xfdf']).toBe('inreplyto')
    expect(properties.id?.['x-xfdf']).toBe('name')
  })

  it('mentions nothing from Inkbar', () => {
    const text = JSON.stringify(schema)
    for (const word of [
      'Inkbar',
      'exportAnnotations',
      'doc.key',
      'UUIDv7',
      'pdf:<ref>',
    ]) {
      expect(text).not.toContain(word)
    }
    walk(schema, (node) => {
      const properties = node.properties as Record<string, unknown> | undefined
      if (properties && typeof properties === 'object') {
        expect(Object.keys(properties)).not.toContain('source')
        expect(Object.keys(properties)).not.toContain('locked')
      }
    })
  })
})
