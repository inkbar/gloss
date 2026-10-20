import { describe, expect, it } from 'vitest'

import {
  ANNOTATION_TYPES,
  Circle,
  FreeText,
  Highlight,
  Ink,
  Line,
  Note,
  Polygon,
  Polyline,
  Redact,
  Square,
  Squiggly,
  Stamp,
  Strikeout,
  Underline,
} from './annotations'

import type { z } from 'zod'

const rect = { x: 72, y: 700, width: 120, height: 14 }
const quad = {
  p1: { x: 72, y: 714 },
  p2: { x: 192, y: 714 },
  p3: { x: 72, y: 700 },
  p4: { x: 192, y: 700 },
}
const base = (type: string, id: string) => ({ type, id, page: 0, rect })

const minHighlight = { ...base('highlight', 'h1'), quads: [quad] }
const minUnderline = { ...base('underline', 'u1'), quads: [quad] }
const minStrikeout = { ...base('strikeout', 's1'), quads: [quad] }
const minSquiggly = { ...base('squiggly', 'q1'), quads: [quad] }
const minNote = base('text', 'n1')
const minFreeText = { ...base('freetext', 'f1'), contents: 'Check this clause' }
const minSquare = base('square', 'sq1')
const minCircle = base('circle', 'c1')
const minLine = {
  ...base('line', 'l1'),
  start: { x: 72, y: 700 },
  end: { x: 192, y: 714 },
}
const vertices = [
  { x: 72, y: 700 },
  { x: 192, y: 714 },
]
const minPolyline = { ...base('polyline', 'pl1'), vertices }
const minPolygon = { ...base('polygon', 'pg1'), vertices }
const minInk = { ...base('ink', 'i1'), inklist: [[{ x: 72, y: 700 }]] }
const minStamp = {
  ...base('stamp', 'st1'),
  imagedata: 'data:image/png;base64,iVBORw0KGgo=',
}
const minRedact = base('redact', 'r1')

const table: [z.ZodType, Record<string, unknown>][] = [
  [Highlight, minHighlight],
  [Underline, minUnderline],
  [Strikeout, minStrikeout],
  [Squiggly, minSquiggly],
  [Note, minNote],
  [FreeText, minFreeText],
  [Square, minSquare],
  [Circle, minCircle],
  [Line, minLine],
  [Polyline, minPolyline],
  [Polygon, minPolygon],
  [Ink, minInk],
  [Stamp, minStamp],
  [Redact, minRedact],
]

describe('annotation types', () => {
  it('lists the fourteen types in order', () => {
    expect(ANNOTATION_TYPES).toEqual([
      'highlight',
      'underline',
      'strikeout',
      'squiggly',
      'text',
      'freetext',
      'square',
      'circle',
      'line',
      'polyline',
      'polygon',
      'ink',
      'stamp',
      'redact',
    ])
    expect(table.map(([, min]) => min.type)).toEqual(ANNOTATION_TYPES)
  })

  it('parses a minimal example of every type', () => {
    for (const [schema, min] of table) {
      const result = schema.safeParse(min)
      expect(result.success, String(min.type)).toBe(true)
    }
  })

  it('requires exactly the required set', () => {
    for (const [schema, min] of table) {
      for (const key of Object.keys(min)) {
        const rest: Record<string, unknown> = { ...min }
        delete rest[key]
        expect(schema.safeParse(rest).success, `${String(min.type)} without ${key}`).toBe(
          false
        )
      }
    }
  })

  it('rejects the wrong type on a definition', () => {
    expect(Highlight.safeParse({ ...minHighlight, type: 'underline' }).success).toBe(
      false
    )
  })

  it('checks the required constraints', () => {
    expect(Highlight.safeParse({ ...minHighlight, quads: [] }).success).toBe(false)
    expect(Polyline.safeParse({ ...minPolyline, vertices: [vertices[0]] }).success).toBe(
      false
    )
    expect(Ink.safeParse({ ...minInk, inklist: [] }).success).toBe(false)
    expect(Ink.safeParse({ ...minInk, inklist: [[]] }).success).toBe(false)
    expect(
      Stamp.safeParse({ ...minStamp, imagedata: 'data:image/gif;base64,R0' }).success
    ).toBe(false)
    expect(
      Redact.safeParse({ ...minRedact, suggestion: { confidence: 1.5 } }).success
    ).toBe(false)
    expect(Redact.safeParse({ ...minRedact, suggestion: {} }).success).toBe(false)
  })

  it('fills documented defaults', () => {
    expect(Note.parse(minNote).icon).toBe('Note')
    expect(Redact.parse(minRedact).origin).toBe('user')
    expect(Line.parse(minLine).width).toBe(1)
    expect(Ink.parse(minInk).width).toBe(2)
    expect(FreeText.parse(minFreeText).width).toBe(0)
    expect(FreeText.parse({ ...minFreeText, defaultStyle: {} }).defaultStyle).toEqual({
      fontFamily: 'Helvetica',
      fontSize: 12,
      textAlign: 'left',
    })
  })

  it('passes unknown fields through', () => {
    const parsed = Redact.parse({
      ...minRedact,
      reviewer: 'x',
      suggestion: { confidence: 0.9, model: 'm' },
    }) as Record<string, unknown>
    expect(parsed.reviewer).toBe('x')
    expect((parsed.suggestion as Record<string, unknown>).model).toBe('m')
    const text = FreeText.parse({
      ...minFreeText,
      defaultStyle: { lineHeight: 1.2 },
    }) as { defaultStyle: Record<string, unknown> }
    expect(text.defaultStyle.lineHeight).toBe(1.2)
  })

  it('no longer refuses the old keys', () => {
    const parsed = Circle.parse({ ...minCircle, cornerRadius: 4 }) as Record<
      string,
      unknown
    >
    expect(parsed.cornerRadius).toBe(4)
    expect(Polygon.safeParse({ ...minPolygon, head: 'OpenArrow' }).success).toBe(true)
    expect(
      FreeText.safeParse({ ...minFreeText, fontSize: 14, align: 'left' }).success
    ).toBe(true)
  })

  it('checks pressure against inklist', () => {
    expect(Ink.safeParse({ ...minInk, pressure: [[0.5]] }).success).toBe(true)
    expect(Ink.safeParse({ ...minInk, pressure: [[0.5, 0.6]] }).success).toBe(false)
    expect(Ink.safeParse({ ...minInk, pressure: [] }).success).toBe(false)
  })
})
