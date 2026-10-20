import { describe, expect, expectTypeOf, it } from 'vitest'

import { ANNOTATION_TYPES } from './annotations'
import { Annotation, GlossDocument, isAnnotation, UnknownAnnotation } from './document'

import type { Redact, RedactInput } from './annotations'
import type { GlossDocumentInput } from './document'

const rect = { x: 72, y: 700, width: 120, height: 14 }

describe('GlossDocument', () => {
  it('accepts a minimal document', () => {
    expect(
      GlossDocument.safeParse({ format: 'gloss', version: 1, annotations: [] }).success
    ).toBe(true)
  })

  it('rejects the wrong format or version', () => {
    expect(
      GlossDocument.safeParse({
        format: 'inkbar/annotations',
        version: 1,
        annotations: [],
      }).success
    ).toBe(false)
    expect(
      GlossDocument.safeParse({ format: 'gloss', version: 2, annotations: [] }).success
    ).toBe(false)
  })

  it('requires format, version and annotations', () => {
    const minimal = { format: 'gloss', version: 1, annotations: [] }
    for (const key of Object.keys(minimal)) {
      const rest: Record<string, unknown> = { ...minimal }
      delete rest[key]
      expect(GlossDocument.safeParse(rest).success, key).toBe(false)
    }
  })

  it('accepts unknown types with type, id and page', () => {
    const item = { type: 'sticker', id: 'a', page: 0, anything: 1 }
    expect(UnknownAnnotation.safeParse(item).success).toBe(true)
    const parsed = GlossDocument.parse({
      format: 'gloss',
      version: 1,
      annotations: [item],
    })
    expect(parsed.annotations[0]).toEqual(item)
  })

  it('rejects an unknown type without id or page', () => {
    expect(UnknownAnnotation.safeParse({ type: 'sticker', page: 0 }).success).toBe(false)
    expect(UnknownAnnotation.safeParse({ type: 'sticker', id: 'a' }).success).toBe(false)
    expect(
      GlossDocument.safeParse({
        format: 'gloss',
        version: 1,
        annotations: [{ type: 'sticker', id: 'a' }],
      }).success
    ).toBe(false)
  })

  it('rejects an unknown type with a bad id or page', () => {
    for (const item of [
      { type: 'sticker', id: 'a', page: -1 },
      { type: 'sticker', id: 'a', page: 1.5 },
      { type: 'sticker', id: '', page: 0 },
    ]) {
      expect(UnknownAnnotation.safeParse(item).success, JSON.stringify(item)).toBe(false)
      expect(
        GlossDocument.safeParse({ format: 'gloss', version: 1, annotations: [item] })
          .success,
        JSON.stringify(item)
      ).toBe(false)
    }
  })

  it('rejects a known type whose id is not a string', () => {
    const item = { type: 'redact', id: 5, page: 0, rect }
    expect(Annotation.safeParse({ ...item, id: 'r1' }).success).toBe(true)
    expect(Annotation.safeParse(item).success).toBe(false)
    expect(UnknownAnnotation.safeParse(item).success).toBe(false)
    expect(
      GlossDocument.safeParse({ format: 'gloss', version: 1, annotations: [item] })
        .success
    ).toBe(false)
  })

  it('does not let a broken known type pass as unknown', () => {
    const broken = { type: 'highlight', id: 'a', page: 0, rect }
    expect(UnknownAnnotation.safeParse(broken).success).toBe(false)
    expect(Annotation.safeParse(broken).success).toBe(false)
    expect(
      GlossDocument.safeParse({ format: 'gloss', version: 1, annotations: [broken] })
        .success
    ).toBe(false)
  })

  it('accepts documentKey and keeps unknown document fields', () => {
    const doc = {
      format: 'gloss',
      version: 1,
      documentKey: 'k',
      annotations: [],
      extra: true,
    }
    expect(GlossDocument.parse(doc)).toEqual(doc)
  })
})

describe('annotation types', () => {
  it('never start with x-, which is left for host types', () => {
    expect(ANNOTATION_TYPES.filter((t) => t.startsWith('x-'))).toEqual([])
  })

  it('match case-sensitively', () => {
    const item = { type: 'Highlight', id: 'a', page: 0 }
    expect(UnknownAnnotation.safeParse(item).success).toBe(true)
    expect(Annotation.safeParse(item).success).toBe(false)
  })
})

describe('isAnnotation', () => {
  it('tells a defined type from an unknown one', () => {
    const { annotations } = GlossDocument.parse({
      format: 'gloss',
      version: 1,
      annotations: [
        { type: 'redact', id: 'r1', page: 0, rect },
        { type: 'x-sticker', id: 's1', page: 0 },
      ],
    })
    expect(annotations.map(isAnnotation)).toEqual([true, false])
  })
})

describe('input types', () => {
  it('take what a writer writes, before defaults are filled', () => {
    const written = { type: 'redact' as const, id: 'r1', page: 0, rect }
    expectTypeOf(written).toExtend<RedactInput>()
    expectTypeOf(written).not.toExtend<Redact>()
    expectTypeOf({
      format: 'gloss' as const,
      version: 1 as const,
      annotations: [written],
    }).toExtend<GlossDocumentInput>()
  })
})
