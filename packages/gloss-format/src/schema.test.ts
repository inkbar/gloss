import { readFileSync } from 'node:fs'

import { Ajv2020 } from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'

import { ANNOTATION_TYPES } from './annotations'
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

  it('names every shared shape and annotation type', () => {
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
        'Highlight',
        'Underline',
        'Strikeout',
        'Squiggly',
        'Note',
        'FreeTextStyle',
        'FreeText',
        'Square',
        'Circle',
        'Line',
        'Polyline',
        'Polygon',
        'Ink',
        'Stamp',
        'Loupe',
        'Mask',
        'Suggestion',
        'Redact',
      ])
    )
  })

  it('marks defaults optional', () => {
    const note = defs.Note as {
      required: string[]
      properties: Record<string, Record<string, unknown>>
    }
    expect(note.required).not.toContain('icon')
    expect(note.properties.icon?.default).toBe('Note')
    expect(note.properties.icon?.$ref).toBe('#/$defs/NoteIcon')
  })

  it('every type has an example that validates', () => {
    const ajv = new Ajv2020({ strict: true, validateFormats: false })
    ajv.addKeyword('x-xfdf')
    ajv.addSchema(schema)
    const types = Object.entries(defs).filter(([, def]) => {
      const type = (def.properties as Record<string, Record<string, unknown>> | undefined)
        ?.type
      return typeof type?.const === 'string'
    })
    expect(
      types.map(
        ([, def]) =>
          (def.properties as Record<string, Record<string, unknown>>).type?.const
      )
    ).toEqual(expect.arrayContaining([...ANNOTATION_TYPES]))
    expect(types).toHaveLength(ANNOTATION_TYPES.length)
    for (const [name, def] of types) {
      const validate = ajv.getSchema(`${String(schema.$id)}#/$defs/${name}`)
      expect(validate, name).toBeDefined()
      const examples = def.examples as unknown[] | undefined
      expect(examples?.length, name).toBeGreaterThan(0)
      for (const example of examples ?? []) {
        expect(validate?.(example), `${name}: ${JSON.stringify(validate?.errors)}`).toBe(
          true
        )
      }
    }
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
