import { z } from 'zod'

import { GLOSS_SCHEMA_ID } from './constants'
import { define, field, gloss, registeredDefinitions } from './registry'
import { Common, Dashes, Fringe, LineEnding, NoteIcon, Quad } from './shapes'

/** A stand-in for the document until the annotation types exist. It refers to every shape. */
const Document = define(
  'Document',
  z.looseObject({
    common: field(Common, { description: 'An annotation.' }).optional(),
    quads: field(Quad.array(), { description: 'Quads.' }).optional(),
    fringe: field(Fringe, { description: 'Insets.' }).optional(),
    dashes: field(Dashes, { description: 'A dash pattern.' }).optional(),
    head: field(LineEnding, { description: 'A line ending.' }).optional(),
    icon: field(NoteIcon, { description: 'A note icon.' }).optional(),
  }),
  { title: 'Document', description: 'A Gloss document.' }
)

const DESCRIPTION =
  'Gloss: a JSON format for PDF annotations. Coordinates are PDF user space in points, origin bottom-left, before /Rotate.'

/**
 * The Gloss JSON Schema, rooted at `root`. `$defs` holds every registered definition, including
 * ones the root doesn't reach.
 */
export function buildSchema(root: z.ZodType = Document): Record<string, unknown> {
  // One object that refers to the root and to every definition, so zod emits them all as $defs.
  const all = z.object({
    root,
    ...Object.fromEntries(
      [...registeredDefinitions()].map(([id, s]) => [`def:${id}`, s])
    ),
  })
  const generated = z.toJSONSchema(all, {
    target: 'draft-2020-12',
    io: 'input',
    metadata: gloss,
    unrepresentable: 'any',
  }) as unknown as {
    $schema: string
    properties: { root: Record<string, unknown> }
    $defs?: Record<string, unknown>
  }
  const { root: rootSchema } = generated.properties
  return {
    $schema: generated.$schema,
    $id: GLOSS_SCHEMA_ID,
    title: 'Gloss',
    description: DESCRIPTION,
    ...(typeof rootSchema.$ref === 'string' ? { $ref: rootSchema.$ref } : rootSchema),
    $defs: generated.$defs ?? {},
  }
}
