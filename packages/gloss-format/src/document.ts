import { z } from 'zod'

import {
  ANNOTATION_TYPES,
  Circle,
  FreeText,
  Highlight,
  Ink,
  Line,
  Loupe,
  Mask,
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
import { GLOSS_FORMAT, GLOSS_VERSION } from './constants'
import { define, field } from './registry'
import { commonFields } from './shapes'

const KNOWN_TYPES: readonly string[] = ANNOTATION_TYPES

export const Annotation = define(
  'Annotation',
  z.discriminatedUnion('type', [
    Highlight,
    Underline,
    Strikeout,
    Squiggly,
    Note,
    FreeText,
    Square,
    Circle,
    Line,
    Polyline,
    Polygon,
    Ink,
    Stamp,
    Loupe,
    Mask,
    Redact,
  ]),
  {
    title: 'Annotation',
    description: 'Any annotation type Gloss defines, chosen by its type field.',
  }
)
export type Annotation = z.infer<typeof Annotation>
export type AnnotationInput = z.input<typeof Annotation>

export const UnknownAnnotation = define(
  'UnknownAnnotation',
  z.looseObject({
    type: field(
      z.string().refine((t) => !KNOWN_TYPES.includes(t), {
        message: 'a known annotation type must match its own definition',
      }),
      {
        description:
          "An annotation type this version of Gloss doesn't define. A type Gloss defines must match its own definition instead.",
      }
    ),
    id: commonFields.id,
    page: commonFields.page,
  }),
  {
    title: 'UnknownAnnotation',
    description:
      "An annotation of a type this version of Gloss does not define, such as one from a newer writer or a host's own. It needs a type, an id and a page. Readers may ignore it or pass it through. Types match case-sensitively, so Highlight is an unknown type. Gloss never defines a type that starts with x-, so a host's own types should use that prefix: no later version can then reject them.",
    examples: [{ type: 'sticker', id: 'a1', page: 0, sticker: 'star' }],
  }
)
export type UnknownAnnotation = z.infer<typeof UnknownAnnotation>
export type UnknownAnnotationInput = z.input<typeof UnknownAnnotation>

/** True when `item` is an annotation type Gloss defines, rather than an unknown one. */
export function isAnnotation(item: Annotation | UnknownAnnotation): item is Annotation {
  return KNOWN_TYPES.includes(item.type)
}

export const GlossDocument = define(
  'Document',
  z.looseObject({
    format: field(z.literal(GLOSS_FORMAT), {
      description: 'Marks the file as Gloss. Always gloss.',
    }),
    version: field(z.literal(GLOSS_VERSION), {
      description:
        'The Gloss format version the document follows. Always 1 for this schema.',
    }),
    documentKey: field(z.string(), {
      description:
        'Optional. Identifies the PDF the annotations belong to, in whatever form the writer and reader agree on.',
    }).optional(),
    annotations: field(z.array(z.union([Annotation, UnknownAnnotation])), {
      description:
        "The annotations, in drawing order. Each is a type Gloss defines or one it doesn't.",
    }),
  }),
  {
    title: 'Document',
    description: 'A Gloss document: the annotations on one PDF.',
    examples: [
      {
        format: GLOSS_FORMAT,
        version: GLOSS_VERSION,
        annotations: [
          {
            type: 'highlight',
            id: 'a1',
            page: 0,
            rect: { x: 72, y: 700, width: 120, height: 14 },
            quads: [
              {
                p1: { x: 72, y: 714 },
                p2: { x: 192, y: 714 },
                p3: { x: 72, y: 700 },
                p4: { x: 192, y: 700 },
              },
            ],
          },
        ],
      },
    ],
  }
)
export type GlossDocument = z.infer<typeof GlossDocument>
export type GlossDocumentInput = z.input<typeof GlossDocument>
