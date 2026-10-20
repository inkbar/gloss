import { z } from 'zod'

import { ANNOTATION_TYPES } from './annotations'
import { GLOSS_SCHEMA_ID } from './constants'
import { GlossDocument, UnknownAnnotation } from './document'
import { gloss, registeredDefinitions } from './registry'

const DESCRIPTION =
  'Gloss: a JSON format for PDF annotations. Coordinates are PDF user space in points, origin bottom-left, before /Rotate.'

/**
 * The Gloss JSON Schema, rooted at `root`. `$defs` holds every registered definition, including
 * ones the root doesn't reach.
 */
export function buildSchema(root: z.ZodType = GlossDocument): Record<string, unknown> {
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
    override: ({ zodSchema, jsonSchema }) => {
      // zod can't express the refine that keeps known types out of UnknownAnnotation.
      if (zodSchema === UnknownAnnotation.shape.type)
        jsonSchema.not = { enum: [...ANNOTATION_TYPES] }
    },
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
