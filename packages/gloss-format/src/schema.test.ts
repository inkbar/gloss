import { readFileSync } from 'node:fs'

import { Ajv2020 } from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'

import { ANNOTATION_TYPES } from './annotations'
import { GLOSS_SCHEMA_ID } from './constants'
import { registeredDefinitions } from './registry'
import { buildSchema } from './schema'

const schema = JSON.parse(
  readFileSync(new URL('../schema.json', import.meta.url), 'utf8')
) as Record<string, unknown>
const defs = schema.$defs as Record<string, Record<string, unknown>>

/** An ajv instance holding the Gloss schema. Formats aren't checked; the zod parse covers them. */
function glossAjv(
  options: { strictTypes?: boolean; strictRequired?: boolean } = {}
): Ajv2020 {
  const ajv = new Ajv2020({ strict: true, validateFormats: false, ...options })
  ajv.addKeyword('x-xfdf')
  ajv.addSchema(schema)
  return ajv
}

/** The validator for the definition `name`. */
function validator(ajv: Ajv2020, name: string) {
  const validate = ajv.getSchema(`${GLOSS_SCHEMA_ID}#/$defs/${name}`)
  if (!validate) throw new Error(`no definition ${name}`)
  return validate
}

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

  it('describes custom as namespaced by owner', () => {
    const props = defs.Common?.properties as Record<string, { description?: string }>
    expect(props.custom?.description).toMatch(/under a key of your own/)
  })

  it('gives no x- naming advice', () => {
    expect(JSON.stringify(schema)).not.toMatch(/x-sticker|starts with x-/)
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
        'Redact',
      ])
    )
    expect(Object.keys(defs)).not.toContain('Suggestion')
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

  it('gives every annotation type an example', () => {
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
      expect((def.examples as unknown[] | undefined)?.length, name).toBeGreaterThan(0)
    }
  })

  it('validates every example against its definition', () => {
    const ajv = glossAjv()
    const withExamples = Object.entries(defs).filter(([, def]) =>
      Array.isArray(def.examples)
    )
    expect(withExamples.map(([name]) => name)).toEqual(
      expect.arrayContaining(['FreeTextStyle', 'Highlight', 'Redact'])
    )
    for (const [name, def] of withExamples) {
      const validate = validator(ajv, name)
      for (const example of def.examples as unknown[]) {
        expect(validate(example), `${name}: ${JSON.stringify(validate.errors)}`).toBe(
          true
        )
      }
    }
  })

  it('parses every example with its zod definition', () => {
    const zodDefs = registeredDefinitions()
    for (const [name, def] of Object.entries(defs)) {
      if (!Array.isArray(def.examples)) continue
      const zod = zodDefs.get(name)
      expect(zod, name).toBeDefined()
      for (const example of def.examples as unknown[]) {
        const result = zod?.safeParse(example)
        expect(result?.success, `${name}: ${JSON.stringify(result?.error?.issues)}`).toBe(
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

  it('writes the opacity default', () => {
    const common = defs.Common?.properties as Record<string, Record<string, unknown>>
    expect(common.opacity?.default).toBe(1)
  })

  it('roots the schema at the document', () => {
    expect(schema.$ref).toBe('#/$defs/Document')
    expect(Object.keys(defs)).toEqual(
      expect.arrayContaining(['Annotation', 'UnknownAnnotation', 'Document'])
    )
    const document = defs.Document as { required: string[] }
    expect([...document.required].sort()).toEqual(['annotations', 'format', 'version'])
  })

  it('excludes the known types from UnknownAnnotation', () => {
    const properties = defs.UnknownAnnotation?.properties as Record<
      string,
      Record<string, unknown>
    >
    expect(properties.type?.not).toEqual({ enum: [...ANNOTATION_TYPES] })
  })
})

describe('validating with the schema', () => {
  const rect = { x: 72, y: 700, width: 120, height: 14 }

  it('accepts a minimal document', () => {
    const validate = validator(glossAjv(), 'Document')
    expect(validate({ format: 'gloss', version: 1, annotations: [] })).toBe(true)
  })

  it('rejects the wrong format or version', () => {
    const validate = validator(glossAjv(), 'Document')
    expect(validate({ format: 'inkbar/annotations', version: 1, annotations: [] })).toBe(
      false
    )
    expect(validate({ format: 'gloss', version: 2, annotations: [] })).toBe(false)
  })

  it('requires format, version and annotations', () => {
    const validate = validator(glossAjv(), 'Document')
    const minimal = { format: 'gloss', version: 1, annotations: [] }
    for (const key of Object.keys(minimal)) {
      const rest: Record<string, unknown> = { ...minimal }
      delete rest[key]
      expect(validate(rest), key).toBe(false)
    }
  })

  it('validates a whole document through the root', () => {
    const ajv = glossAjv()
    const validate = ajv.getSchema(GLOSS_SCHEMA_ID)
    expect(validate?.({ format: 'gloss', version: 1, annotations: [] })).toBe(true)
    expect(validate?.({ format: 'gloss', version: 2, annotations: [] })).toBe(false)
  })

  it('accepts unknown types with type, id and page', () => {
    const ajv = glossAjv()
    const item = { type: 'sticker', id: 'a', page: 0, anything: 1 }
    expect(validator(ajv, 'UnknownAnnotation')(item)).toBe(true)
    expect(
      validator(ajv, 'Document')({ format: 'gloss', version: 1, annotations: [item] })
    ).toBe(true)
  })

  it('rejects an unknown type without id or page', () => {
    const ajv = glossAjv()
    expect(validator(ajv, 'UnknownAnnotation')({ type: 'sticker', page: 0 })).toBe(false)
    expect(validator(ajv, 'UnknownAnnotation')({ type: 'sticker', id: 'a' })).toBe(false)
  })

  it('rejects an unknown type with a bad id or page', () => {
    const ajv = glossAjv()
    for (const item of [
      { type: 'sticker', id: 'a', page: -1 },
      { type: 'sticker', id: 'a', page: 1.5 },
      { type: 'sticker', id: '', page: 0 },
    ]) {
      expect(validator(ajv, 'UnknownAnnotation')(item), JSON.stringify(item)).toBe(false)
      expect(
        validator(ajv, 'Document')({ format: 'gloss', version: 1, annotations: [item] }),
        JSON.stringify(item)
      ).toBe(false)
    }
  })

  it('rejects a known type whose id is not a string', () => {
    const ajv = glossAjv()
    const item = { type: 'redact', id: 5, page: 0, rect }
    expect(validator(ajv, 'Annotation')({ ...item, id: 'r1' })).toBe(true)
    expect(validator(ajv, 'Annotation')(item)).toBe(false)
    expect(validator(ajv, 'UnknownAnnotation')(item)).toBe(false)
    expect(
      validator(ajv, 'Document')({ format: 'gloss', version: 1, annotations: [item] })
    ).toBe(false)
  })

  it('does not let a broken known type pass as unknown', () => {
    const ajv = glossAjv()
    const broken = { type: 'highlight', id: 'a', page: 0, rect }
    expect(validator(ajv, 'UnknownAnnotation')(broken)).toBe(false)
    expect(validator(ajv, 'Annotation')(broken)).toBe(false)
    expect(
      validator(ajv, 'Document')({ format: 'gloss', version: 1, annotations: [broken] })
    ).toBe(false)
  })

  it('validates a document holding every example', () => {
    const validate = validator(glossAjv(), 'Document')
    const annotations = Object.values(defs)
      .filter((def) => {
        const type = (
          def.properties as Record<string, Record<string, unknown>> | undefined
        )?.type
        return typeof type?.const === 'string'
      })
      .map((def) => (def.examples as unknown[])[0])
    expect(annotations).toHaveLength(ANNOTATION_TYPES.length)
    const document = {
      format: 'gloss',
      version: 1,
      annotations: [...annotations, { type: 'sticker', id: 'x', page: 2 }],
    }
    expect(validate(document), JSON.stringify(validate.errors)).toBe(true)
  })

  // The consumer's schema puts `required` beside `allOf`, without `type` or `properties`, which
  // ajv's strict lints flag. Gloss's schema itself still compiles under full strict mode.
  it('lets a consumer tighten a definition by URL', () => {
    const ajv = glossAjv({ strictTypes: false, strictRequired: false })
    const validate = ajv.compile({
      $id: 'https://example.test/api.json',
      allOf: [{ $ref: 'https://gloss-format.org/schema/v1.json#/$defs/Redact' }],
      required: ['author', 'createdAt'],
    })
    const redaction = { type: 'redact', id: 'r1', page: 0, rect }
    const createdAt = '2026-10-20T09:30:00Z'
    expect(validate({ ...redaction, createdAt })).toBe(false)
    expect(validate({ ...redaction, author: 'Ed' })).toBe(false)
    expect(
      validate({ ...redaction, author: 'Ed', createdAt }),
      JSON.stringify(validate.errors)
    ).toBe(true)
  })

  it('works inside an OpenAPI 3.1 component', () => {
    const ajv = glossAjv()
    const validate = ajv.compile({
      $id: 'https://example.test/components.json',
      type: 'array',
      items: { $ref: 'https://gloss-format.org/schema/v1.json#/$defs/Redact' },
    })
    const list = [
      { type: 'redact', id: 'r1', page: 0, rect },
      { type: 'redact', id: 'r2', page: 1, rect },
    ]
    expect(validate(list), JSON.stringify(validate.errors)).toBe(true)
    expect(validate([{ type: 'redact', id: 'r3', page: 0 }])).toBe(false)
  })
})
