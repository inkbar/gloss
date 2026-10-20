import { describe, expect, it } from 'vitest'

import { Annotation, GlossDocument, UnknownAnnotation } from './document'

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
