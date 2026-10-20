import { z } from 'zod'

/** Metadata Gloss attaches to a definition or a field. It reaches the JSON Schema as keywords. */
export interface GlossMeta {
  description: string
  title?: string
  examples?: unknown[]
  /** The XFDF element (on a type) or attribute (on a field) this maps to. */
  'x-xfdf'?: string
}

/**
 * Gloss's own registry. It is private rather than zod's global one, so a consumer's global ids
 * can't clash with Gloss names.
 */
export const gloss = z.registry<GlossMeta & { id?: string }>()

const definitions = new Map<string, z.ZodType>()

/** Registers `schema` as the named definition `id` and returns it. */
export function define<T extends z.ZodType>(id: string, schema: T, meta: GlossMeta): T {
  if (definitions.has(id)) throw new Error(`Gloss definition ${id} is already defined`)
  definitions.set(id, schema)
  gloss.add(schema, { ...meta, id })
  return schema
}

/**
 * A field: `schema` with its own description and XFDF name, keeping any `$ref`.
 *
 * It describes a clone, so the shared definition keeps its own metadata. zod links the clone to
 * the original, so a field whose schema is a named definition comes out as `$ref` plus the
 * field's own keywords.
 *
 * A field can't be made from another field: the clone would hide the definition and inline it.
 * Describe the definition directly instead.
 */
export function field<T extends z.ZodType>(schema: T, meta: GlossMeta): T {
  if (gloss.has(schema) && gloss.get(schema)?.id === undefined)
    throw new Error(
      `field() got a schema that is already a field (${gloss.get(schema)?.description ?? ''}); describe the original schema instead`
    )
  const clone = schema.clone()
  gloss.add(clone, meta)
  return clone
}

/** Every named definition, in the order it was defined. */
export function registeredDefinitions(): ReadonlyMap<string, z.ZodType> {
  return definitions
}
