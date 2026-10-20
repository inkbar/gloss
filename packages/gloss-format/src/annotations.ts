import { z } from 'zod'

import { define, field } from './registry'
import {
  Color,
  commonFields,
  Dashes,
  Fringe,
  LineEnding,
  NoteIcon,
  Point,
  Quad,
} from './shapes'

/** Every annotation `type` Gloss defines, in the order the definitions appear. */
export const ANNOTATION_TYPES = [
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
  'loupe',
  'mask',
  'redact',
] as const

/** A PNG or JPEG image as a base64 `data:` URL. */
export const IMAGE_DATA_URL = /^data:image\/(png|jpeg);base64,/

const EXTENSION = 'An extension; XFDF has no equivalent.'

/** The `type` field of a definition: always `value`. */
function typeField<const T extends string>(value: T) {
  return field(z.literal(value), { description: `The annotation type. Always ${value}.` })
}

function strokeWidth(fallback: number, what = 'The stroke width in points.') {
  return field(z.number().nonnegative(), {
    description: `${what} Absent means ${fallback}.`,
    'x-xfdf': 'width',
  }).default(fallback)
}

function dashes() {
  return field(Dashes, {
    description: 'The dash pattern of the stroke. Absent means a solid line.',
    'x-xfdf': 'dashes',
  }).optional()
}

function interiorColor(absent = 'Absent means no fill.') {
  return field(Color, {
    description: `The fill inside the shape. ${absent}`,
    'x-xfdf': 'interior-color',
  }).optional()
}

function lineEnding(at: string, xfdf: 'head' | 'tail') {
  return field(LineEnding, {
    description: `The line ending at ${at}. Absent means None.`,
    'x-xfdf': xfdf,
  }).optional()
}

function vertices() {
  return field(Point.array().min(2), {
    description: 'The points the lines join, in order. At least two.',
    'x-xfdf': 'vertices',
  })
}

const sample = {
  id: 'a1',
  page: 0,
  author: 'Ana',
  createdAt: '2026-10-19T12:00:00Z',
}
const sampleQuads = [
  {
    p1: { x: 72, y: 714 },
    p2: { x: 192, y: 714 },
    p3: { x: 72, y: 700 },
    p4: { x: 192, y: 700 },
  },
]
const sampleTextRect = { x: 72, y: 700, width: 120, height: 14 }

const MARKUP = {
  highlight: ['Highlight', 'A highlight over a run of text.', '#FFE066'],
  underline: ['Underline', 'A line under a run of text.', '#2F6FDE'],
  strikeout: ['Strikeout', 'A line through a run of text.', '#D93025'],
  squiggly: ['Squiggly', 'A wavy line under a run of text.', '#D93025'],
} as const

/** A text markup type: the common fields plus the quads it covers. */
function textMarkup<const T extends keyof typeof MARKUP>(type: T) {
  const [name, description, color] = MARKUP[type]
  return define(
    name,
    z.looseObject({
      type: typeField(type),
      ...commonFields,
      quads: field(Quad.array().min(1), {
        description: 'The runs of text the mark covers, one quad per line. At least one.',
        'x-xfdf': 'coords',
      }),
    }),
    {
      title: name,
      description: `${description} XFDF element ${type}.`,
      'x-xfdf': type,
      examples: [{ type, ...sample, rect: sampleTextRect, color, quads: sampleQuads }],
    }
  )
}

export const Highlight = textMarkup('highlight')
export type Highlight = z.infer<typeof Highlight>

export const Underline = textMarkup('underline')
export type Underline = z.infer<typeof Underline>

export const Strikeout = textMarkup('strikeout')
export type Strikeout = z.infer<typeof Strikeout>

export const Squiggly = textMarkup('squiggly')
export type Squiggly = z.infer<typeof Squiggly>

export const Note = define(
  'Note',
  z.looseObject({
    type: typeField('text'),
    ...commonFields,
    icon: field(NoteIcon, {
      description: 'The icon the note shows on the page. Absent means Note.',
      'x-xfdf': 'icon',
    }).default('Note'),
  }),
  {
    title: 'Note',
    description:
      'A note: an icon on the page that opens to show its contents. XFDF element text.',
    'x-xfdf': 'text',
    examples: [
      {
        type: 'text',
        ...sample,
        rect: { x: 400, y: 700, width: 20, height: 20 },
        contents: 'Is this date right?',
        icon: 'Comment',
      },
    ],
  }
)
export type Note = z.infer<typeof Note>

export const FreeTextStyle = define(
  'FreeTextStyle',
  z.looseObject({
    fontFamily: field(z.string().min(1), {
      description:
        'The font family. Absent means Helvetica. XFDF writes it as font-family.',
    }).default('Helvetica'),
    fontSize: field(z.number().positive(), {
      description:
        'The font size in points. Absent means 12. XFDF writes it as font-size.',
    }).default(12),
    color: field(Color, {
      description: 'The text colour. Absent: the reader chooses the text colour.',
    }).optional(),
    textAlign: field(z.enum(['left', 'center', 'right', 'justify']), {
      description:
        'How lines of text line up in the box. Absent means left. XFDF writes it as text-align.',
    }).default('left'),
    fontWeight: field(z.literal('bold'), {
      description:
        'Bold text. Absent means normal weight. XFDF writes it as font-weight.',
    }).optional(),
    fontStyle: field(z.literal('italic'), {
      description: 'Italic text. Absent means upright. XFDF writes it as font-style.',
    }).optional(),
    textDecoration: field(z.literal('underline'), {
      description:
        'Underlined text. Absent means no underline. XFDF writes it as text-decoration.',
    }).optional(),
  }),
  {
    title: 'FreeTextStyle',
    description:
      "A free-text box's text style. The keys are the CSS property names XFDF writes in its defaultstyle string, in camel case.",
    examples: [{ fontFamily: 'Helvetica', fontSize: 12, color: '#1A1A1A' }],
  }
)
export type FreeTextStyle = z.infer<typeof FreeTextStyle>

export const FreeText = define(
  'FreeText',
  z.looseObject({
    type: typeField('freetext'),
    ...commonFields,
    contents: field(z.string(), {
      description: 'The text shown on the page.',
      'x-xfdf': 'contents',
    }),
    color: field(Color, {
      description: "The box's fill. Absent means no fill.",
      'x-xfdf': 'color',
    }).optional(),
    borderColor: field(Color, {
      description: `The border's colour. Absent: the reader chooses the colour. ${EXTENSION}`,
    }).optional(),
    width: strokeWidth(0, "The border's width in points; 0 draws no border."),
    dashes: dashes(),
    cornerRadius: field(z.number().nonnegative(), {
      description: `The radius of the box's corners in points. Absent means square corners. ${EXTENSION}`,
    }).optional(),
    defaultStyle: field(FreeTextStyle, {
      description: "The text style. Absent: each style field's own default applies.",
      'x-xfdf': 'defaultstyle',
    }).optional(),
    fringe: field(Fringe, {
      description: 'The insets from rect to the text box. Absent means the box is rect.',
      'x-xfdf': 'fringe',
    }).optional(),
    callout: field(Point.array().min(2).max(3), {
      description:
        "A callout's leader line: the tip, an optional bend, and the point where it meets the box (PDF /CL). Absent means no leader line.",
      'x-xfdf': 'callout',
    }).optional(),
    head: lineEnding("a callout's tip", 'head'),
  }),
  {
    title: 'FreeText',
    description:
      'Text drawn directly on the page in a box. color is the fill of the box and defaultStyle holds the text style. XFDF element freetext.',
    'x-xfdf': 'freetext',
    examples: [
      {
        type: 'freetext',
        ...sample,
        rect: { x: 72, y: 600, width: 220, height: 40 },
        contents: 'Check this clause',
        defaultStyle: { fontSize: 14, color: '#1A1A1A' },
      },
    ],
  }
)
export type FreeText = z.infer<typeof FreeText>

export const Square = define(
  'Square',
  z.looseObject({
    type: typeField('square'),
    ...commonFields,
    width: strokeWidth(1),
    dashes: dashes(),
    interiorColor: interiorColor(),
    cornerRadius: field(z.number().nonnegative(), {
      description: `The radius of the corners in points. Absent means square corners. ${EXTENSION}`,
    }).optional(),
  }),
  {
    title: 'Square',
    description: 'A rectangle drawn to fill rect. XFDF element square.',
    'x-xfdf': 'square',
    examples: [
      {
        type: 'square',
        ...sample,
        rect: { x: 72, y: 500, width: 200, height: 80 },
        color: '#D93025',
        width: 2,
      },
    ],
  }
)
export type Square = z.infer<typeof Square>

export const Circle = define(
  'Circle',
  z.looseObject({
    type: typeField('circle'),
    ...commonFields,
    width: strokeWidth(1),
    dashes: dashes(),
    interiorColor: interiorColor(),
  }),
  {
    title: 'Circle',
    description: 'An ellipse inscribed in rect. XFDF element circle.',
    'x-xfdf': 'circle',
    examples: [
      {
        type: 'circle',
        ...sample,
        rect: { x: 300, y: 500, width: 80, height: 80 },
        color: '#2F6FDE',
        interiorColor: '#DCE8FB',
      },
    ],
  }
)
export type Circle = z.infer<typeof Circle>

export const Line = define(
  'Line',
  z.looseObject({
    type: typeField('line'),
    ...commonFields,
    start: field(Point, { description: 'Where the line starts.', 'x-xfdf': 'start' }),
    end: field(Point, { description: 'Where the line ends.', 'x-xfdf': 'end' }),
    width: strokeWidth(1),
    dashes: dashes(),
    head: lineEnding('the start', 'head'),
    tail: lineEnding('the end', 'tail'),
  }),
  {
    title: 'Line',
    description: 'A straight line from start to end. XFDF element line.',
    'x-xfdf': 'line',
    examples: [
      {
        type: 'line',
        ...sample,
        rect: { x: 72, y: 400, width: 200, height: 50 },
        start: { x: 72, y: 400 },
        end: { x: 272, y: 450 },
        tail: 'OpenArrow',
      },
    ],
  }
)
export type Line = z.infer<typeof Line>

export const Polyline = define(
  'Polyline',
  z.looseObject({
    type: typeField('polyline'),
    ...commonFields,
    vertices: vertices(),
    width: strokeWidth(1),
    dashes: dashes(),
    interiorColor: interiorColor(),
    head: lineEnding('the first vertex', 'head'),
    tail: lineEnding('the last vertex', 'tail'),
  }),
  {
    title: 'Polyline',
    description:
      'Straight lines joining vertices in order, left open. XFDF element polyline.',
    'x-xfdf': 'polyline',
    examples: [
      {
        type: 'polyline',
        ...sample,
        rect: { x: 72, y: 300, width: 200, height: 60 },
        vertices: [
          { x: 72, y: 300 },
          { x: 172, y: 360 },
          { x: 272, y: 300 },
        ],
        width: 2,
      },
    ],
  }
)
export type Polyline = z.infer<typeof Polyline>

export const Polygon = define(
  'Polygon',
  z.looseObject({
    type: typeField('polygon'),
    ...commonFields,
    vertices: vertices(),
    width: strokeWidth(1),
    dashes: dashes(),
    interiorColor: interiorColor(),
  }),
  {
    title: 'Polygon',
    description:
      'Straight lines joining vertices in order, closed back to the first. XFDF element polygon.',
    'x-xfdf': 'polygon',
    examples: [
      {
        type: 'polygon',
        ...sample,
        rect: { x: 72, y: 200, width: 200, height: 60 },
        vertices: [
          { x: 72, y: 200 },
          { x: 172, y: 260 },
          { x: 272, y: 200 },
        ],
        interiorColor: '#FFE066',
      },
    ],
  }
)
export type Polygon = z.infer<typeof Polygon>

/** Pressure must have one value per point of each stroke. */
function checkPressure(
  a: { inklist: unknown[][]; pressure?: unknown[][] | undefined },
  ctx: z.core.$RefinementCtx
): void {
  if (!a.pressure) return
  const ok =
    a.pressure.length === a.inklist.length &&
    a.pressure.every((p, i) => p.length === a.inklist[i]?.length)
  if (!ok)
    ctx.addIssue({
      code: 'custom',
      path: ['pressure'],
      message: 'pressure must have the same shape as inklist',
    })
}

export const Ink = define(
  'Ink',
  z
    .looseObject({
      type: typeField('ink'),
      ...commonFields,
      inklist: field(Point.array().min(1).array().min(1), {
        description:
          'The strokes, each a list of points in the order they were drawn. At least one stroke of at least one point.',
        'x-xfdf': 'inklist',
      }),
      pressure: field(z.array(z.array(z.number().min(0).max(1))), {
        description:
          'Pen pressure per point, from 0 to 1. It has the same shape as inklist: one list per stroke, one value per point. JSON Schema cannot check that rule, so a validator must. Absent means no pressure data, as with mouse input.',
      }).optional(),
      width: strokeWidth(2),
      dashes: dashes(),
    })
    .superRefine(checkPressure),
  {
    title: 'Ink',
    description: 'Freehand strokes. XFDF element ink.',
    'x-xfdf': 'ink',
    examples: [
      {
        type: 'ink',
        ...sample,
        rect: { x: 100, y: 100, width: 60, height: 30 },
        inklist: [
          [
            { x: 100, y: 100 },
            { x: 130, y: 130 },
            { x: 160, y: 110 },
          ],
        ],
        color: '#1A1A1A',
      },
    ],
  }
)
export type Ink = z.infer<typeof Ink>

export const Stamp = define(
  'Stamp',
  z.looseObject({
    type: typeField('stamp'),
    ...commonFields,
    imagedata: field(
      z.string().regex(IMAGE_DATA_URL, 'expected a PNG or JPEG data URL'),
      {
        description: 'The image, as a base64 PNG or JPEG data URL.',
        'x-xfdf': 'imagedata',
      }
    ),
    rotation: field(z.literal([0, 90, 180, 270]), {
      description:
        'Quarter turns, in degrees anticlockwise, the image is turned within rect. Absent means upright in user space.',
      'x-xfdf': 'rotation',
    }).optional(),
  }),
  {
    title: 'Stamp',
    description:
      'An image drawn to fill rect. A signature is a stamp with subject Signature. XFDF element stamp.',
    'x-xfdf': 'stamp',
    examples: [
      {
        type: 'stamp',
        ...sample,
        rect: { x: 350, y: 80, width: 160, height: 50 },
        imagedata: 'data:image/png;base64,iVBORw0KGgo=',
        subject: 'Signature',
      },
    ],
  }
)
export type Stamp = z.infer<typeof Stamp>

export const Loupe = define(
  'Loupe',
  z.looseObject({
    type: typeField('loupe'),
    ...commonFields,
    magnification: field(z.number().gt(1), {
      description:
        'How many times larger the content under the centre is drawn. Above 1. Absent means 2.',
    }).default(2),
    width: strokeWidth(2, "The rim's width in points."),
  }),
  {
    title: 'Loupe',
    description: `A magnifier: a circle inscribed in rect that shows the page content under its own centre, magnified. color and width draw its rim. ${EXTENSION}`,
    examples: [
      {
        type: 'loupe',
        ...sample,
        rect: { x: 200, y: 300, width: 120, height: 120 },
        magnification: 3,
      },
    ],
  }
)
export type Loupe = z.infer<typeof Loupe>

export const Mask = define(
  'Mask',
  z.looseObject({
    type: typeField('mask'),
    ...commonFields,
    shape: field(z.enum(['rect', 'ellipse']), {
      description:
        'What stays clear: the rectangle rect itself, or the ellipse inscribed in it.',
    }),
    dim: field(z.number().min(0).max(1), {
      description:
        'How strongly the dimming covers, from 0 (none) to 1 (opaque). Absent means 0.5.',
    }).default(0.5),
  }),
  {
    title: 'Mask',
    description: `Dims everything on the page outside shape drawn in rect. color is the dimming colour. One per page: a second one replaces the first. ${EXTENSION}`,
    examples: [
      {
        type: 'mask',
        ...sample,
        rect: { x: 72, y: 400, width: 300, height: 200 },
        shape: 'ellipse',
        dim: 0.7,
      },
    ],
  }
)
export type Mask = z.infer<typeof Mask>

export const Suggestion = define(
  'Suggestion',
  z.looseObject({
    confidence: field(z.number().min(0).max(1), {
      description: 'How sure the detector is, from 0 to 1.',
    }),
    jobId: field(z.string(), {
      description: 'The detection run that made the suggestion. Absent means unknown.',
    }).optional(),
    reason: field(z.string(), {
      description:
        'A short label for what was found, such as a name or an account number. Absent means none.',
    }).optional(),
    explanation: field(z.string(), {
      description: 'Why the text was suggested, for the reviewer. Absent means none.',
    }).optional(),
    recommendation: field(z.enum(['redact', 'review', 'keep']), {
      description:
        'What the detector recommends doing with the mark. Absent means no recommendation.',
    }).optional(),
  }),
  {
    title: 'Suggestion',
    description: `Why a redaction was suggested: what a detector found and how sure it is. ${EXTENSION}`,
    examples: [{ confidence: 0.92, reason: 'Person name', recommendation: 'redact' }],
  }
)
export type Suggestion = z.infer<typeof Suggestion>

export const Redact = define(
  'Redact',
  z.looseObject({
    type: typeField('redact'),
    ...commonFields,
    quads: field(Quad.array().min(1), {
      description:
        'The runs of text the mark covers, one quad per line. Absent for a mark over an area rather than text.',
      'x-xfdf': 'coords',
    }).optional(),
    interiorColor: field(Color, {
      description:
        'The fill once the redaction is applied. Absent: the reader chooses the fill.',
      'x-xfdf': 'interior-color',
    }).optional(),
    overlayText: field(z.string(), {
      description: 'Text drawn over the fill once applied. Absent means none.',
      'x-xfdf': 'overlay-text',
    }).optional(),
    origin: field(z.enum(['user', 'suggested']), {
      description: `user for a mark a person made or accepted, suggested for one waiting for review. Absent means user. ${EXTENSION}`,
    }).default('user'),
    suggestion: field(Suggestion, {
      description:
        'Why the mark was suggested. Kept after a person accepts it. Absent for a mark a person made.',
    }).optional(),
  }),
  {
    title: 'Redact',
    description:
      'A mark over content to be removed. Applying it removes the content and fills the area. XFDF element redact.',
    'x-xfdf': 'redact',
    examples: [
      {
        type: 'redact',
        ...sample,
        rect: sampleTextRect,
        quads: sampleQuads,
        origin: 'suggested',
        suggestion: { confidence: 0.92, reason: 'Person name' },
      },
    ],
  }
)
export type Redact = z.infer<typeof Redact>
