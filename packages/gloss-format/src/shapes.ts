import { z } from 'zod'

import { define, field } from './registry'

/**
 * A PDF name: a non-empty run of regular characters, so no whitespace and none of the
 * delimiters `( ) < > [ ] { } / %`.
 */
export const PDF_NAME = /^[^\s()<>[\]{}/%]+$/

/** Line ending styles (PDF `/LE`). */
export const LINE_ENDINGS = [
  'None',
  'Square',
  'Circle',
  'Diamond',
  'OpenArrow',
  'ClosedArrow',
  'Butt',
  'ROpenArrow',
  'RClosedArrow',
  'Slash',
] as const

/** Note icons (PDF `/Name` on a text annotation). */
export const NOTE_ICONS = [
  'Comment',
  'Note',
  'Help',
  'Insert',
  'Key',
  'NewParagraph',
  'Paragraph',
] as const

/** Annotation intents (PDF `/IT`). */
export const INTENTS = [
  'FreeText',
  'FreeTextCallout',
  'FreeTextTypeWriter',
  'LineArrow',
  'LineDimension',
  'PolygonCloud',
  'PolygonDimension',
  'PolyLineDimension',
] as const

/** True when `v` is one of the values in `list`. */
export function isKnown<K extends readonly string[]>(list: K, v: string): v is K[number] {
  return (list as readonly string[]).includes(v)
}

/**
 * An open set of PDF names: the known values, or any other valid PDF name, which a reader keeps
 * unchanged. The type keeps autocomplete for the known values.
 */
function pdfNameSet<const K extends readonly [string, ...string[]]>(known: K) {
  return z.union([
    z.enum(known),
    z.string().regex(PDF_NAME, 'expected a PDF name'),
  ]) as z.ZodType<K[number] | (string & {}), K[number] | (string & {})>
}

/** `description` for an open PDF-name set. */
function nameSetText(what: string, known: readonly string[]): string {
  return `${what} One of ${known.join(', ')}. Any other PDF name is allowed and is kept unchanged.`
}

export const Point = define(
  'Point',
  z.looseObject({
    x: field(z.number(), { description: 'Horizontal position in points.' }),
    y: field(z.number(), {
      description: 'Vertical position in points, measured up from the bottom.',
    }),
  }),
  {
    title: 'Point',
    description: 'A point in PDF user space: points, origin bottom-left, before /Rotate.',
  }
)
export type Point = z.infer<typeof Point>
export type PointInput = z.input<typeof Point>

export const Rect = define(
  'Rect',
  z.looseObject({
    x: field(z.number(), { description: 'Left edge in points.' }),
    y: field(z.number(), { description: 'Bottom edge in points.' }),
    width: field(z.number().nonnegative(), { description: 'Width in points.' }),
    height: field(z.number().nonnegative(), { description: 'Height in points.' }),
  }),
  {
    title: 'Rect',
    description:
      'A rectangle in PDF user space, given by its bottom-left corner and its size. XFDF writes it as x1,y1,x2,y2.',
  }
)
export type Rect = z.infer<typeof Rect>
export type RectInput = z.input<typeof Rect>

export const Quad = define(
  'Quad',
  z.looseObject({
    p1: field(Point, { description: 'Top-left corner.' }),
    p2: field(Point, { description: 'Top-right corner.' }),
    p3: field(Point, { description: 'Bottom-left corner.' }),
    p4: field(Point, { description: 'Bottom-right corner.' }),
  }),
  {
    title: 'Quad',
    description:
      'A quadrilateral over a run of text, its corners in the order PDF uses for /QuadPoints. It need not be axis-aligned.',
  }
)
export type Quad = z.infer<typeof Quad>
export type QuadInput = z.input<typeof Quad>

export const Color = define(
  'Color',
  z.string().regex(/^#[0-9a-fA-F]{6}$/, 'expected #RRGGBB'),
  {
    title: 'Color',
    description: 'An sRGB colour as #RRGGBB.',
  }
)
export type Color = z.infer<typeof Color>
export type ColorInput = z.input<typeof Color>

export const Fringe = define(
  'Fringe',
  z.looseObject({
    left: field(z.number().nonnegative(), {
      description: 'Inset from the left edge in points.',
    }),
    top: field(z.number().nonnegative(), {
      description: 'Inset from the top edge in points.',
    }),
    right: field(z.number().nonnegative(), {
      description: 'Inset from the right edge in points.',
    }),
    bottom: field(z.number().nonnegative(), {
      description: 'Inset from the bottom edge in points.',
    }),
  }),
  {
    title: 'Fringe',
    description:
      "Insets from an annotation's rect to the area it draws in, in points (PDF /RD, XFDF fringe, both in this order).",
  }
)
export type Fringe = z.infer<typeof Fringe>
export type FringeInput = z.input<typeof Fringe>

export const Dashes = define('Dashes', z.array(z.number().nonnegative()).min(1), {
  title: 'Dashes',
  description:
    'A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D).',
})
export type Dashes = z.infer<typeof Dashes>
export type DashesInput = z.input<typeof Dashes>

export const LineEnding = define('LineEnding', pdfNameSet(LINE_ENDINGS), {
  title: 'LineEnding',
  description: nameSetText(
    'The shape drawn at the end of a line (XFDF head and tail, PDF /LE).',
    LINE_ENDINGS
  ),
})
export type LineEnding = z.infer<typeof LineEnding>
export type LineEndingInput = z.input<typeof LineEnding>

export const NoteIcon = define('NoteIcon', pdfNameSet(NOTE_ICONS), {
  title: 'NoteIcon',
  description: nameSetText(
    'The icon a note shows on the page (XFDF icon, PDF /Name).',
    NOTE_ICONS
  ),
})
export type NoteIcon = z.infer<typeof NoteIcon>
export type NoteIconInput = z.input<typeof NoteIcon>

export const Intent = define('Intent', pdfNameSet(INTENTS), {
  title: 'Intent',
  description: nameSetText(
    'What a mark is for, such as a callout or an arrow (XFDF intent, PDF /IT).',
    INTENTS
  ),
})
export type Intent = z.infer<typeof Intent>
export type IntentInput = z.input<typeof Intent>

const dateTime = z.iso.datetime({ offset: true })

/** The fields every annotation has, without `type`. Each annotation type spreads these. */
export const commonFields = {
  id: field(z.string().min(1), {
    description: 'Unique within the document. Never reused for a different annotation.',
    'x-xfdf': 'name',
  }),
  page: field(z.number().int().nonnegative(), {
    description: 'The page the annotation is on, counted from 0.',
    'x-xfdf': 'page',
  }),
  rect: field(Rect, {
    description: 'The bounding box, in PDF user space.',
    'x-xfdf': 'rect',
  }),
  color: field(Color, {
    description: "The annotation's colour. Absent: the reader chooses the colour.",
    'x-xfdf': 'color',
  }).optional(),
  opacity: field(z.number().min(0).max(1), {
    description: 'Opacity, from 0 (invisible) to 1 (opaque). Absent means opaque.',
    'x-xfdf': 'opacity',
  }).default(1),
  author: field(z.string(), {
    description: 'Who made the annotation. Absent means unknown.',
    'x-xfdf': 'title',
  }).optional(),
  contents: field(z.string(), {
    description:
      "The annotation's text, such as a comment or a note. Absent means no text.",
    'x-xfdf': 'contents',
  }).optional(),
  inReplyTo: field(z.string(), {
    description:
      'The id of the annotation this one replies to. Replies form threads. Absent means the annotation is not a reply.',
    'x-xfdf': 'inreplyto',
  }).optional(),
  createdAt: field(dateTime, {
    description:
      'When the annotation was made, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string (D:20261019120000Z). Absent means unknown.',
    'x-xfdf': 'creationdate',
  }).optional(),
  modifiedAt: field(dateTime, {
    description:
      'When the annotation last changed, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string. Absent means unknown.',
    'x-xfdf': 'date',
  }).optional(),
  subject: field(z.string(), {
    description: 'A short label for what the mark is. Absent means no label.',
    'x-xfdf': 'subject',
  }).optional(),
  intent: field(Intent, {
    description:
      "What the mark is for, such as a callout or an arrow. Absent means the type's plain form.",
    'x-xfdf': 'intent',
  }).optional(),
  custom: field(z.record(z.string(), z.unknown()), {
    description:
      'Data of your own, under a key of your own, such as your product\'s name: { "acme": { ... } }. Gloss readers keep it as it is and never interpret it. Absent means none.',
  }).optional(),
}

export const Common = define(
  'Common',
  z.looseObject({
    type: field(z.string(), {
      description:
        "The annotation type, such as highlight or note. Readers keep a type they don't know.",
    }),
    ...commonFields,
  }),
  {
    title: 'Common',
    description:
      'The fields every annotation accepts. Each annotation type lists them alongside its own, and a schema of your own can refer to this definition.',
  }
)
export type Common = z.infer<typeof Common>
export type CommonInput = z.input<typeof Common>
