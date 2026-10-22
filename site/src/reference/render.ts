/**
 * Renders one Starlight Markdown page per `$defs` entry of the Gloss JSON Schema. Pure: it
 * takes schema nodes and returns strings. `generate.ts` does the file work.
 */

export type JsonSchema = Record<string, unknown>

export type Group = 'Document' | 'Annotation types' | 'Shared shapes' | 'Enums'

const DOCUMENT_GROUP = new Set([
  'Document',
  'Annotation',
  'UnknownAnnotation',
  'Fields',
  'FieldValue',
  'SignatureFieldValue',
])
/** zod's `int()` bounds every integer by the safe-integer range. It isn't a real constraint. */
const SAFE_INTEGER_BOUNDS = new Set([Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])

/** `FreeTextStyle` -> `free-text-style`. */
export function slugFor(defName: string): string {
  return defName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function groupFor(defName: string, def: JsonSchema): Group {
  if (DOCUMENT_GROUP.has(defName)) return 'Document'
  const type = properties(def)['type']
  if (type && 'const' in type) return 'Annotation types'
  // A set of values: a plain enum, or known values plus any other matching a pattern.
  if (Array.isArray(def['enum']) || valueSet(def)) return 'Enums'
  return 'Shared shapes'
}

/**
 * The type of a schema node as Markdown: the base type, then its constraints, separated by
 * semicolons. A `$ref` becomes a link relative to a reference page, such as `../rect/`, so it
 * works under any base.
 */
export function describeType(node: JsonSchema, fromSlug: string): string {
  const { base, constraints } = describe(node, fromSlug)
  return [base, ...constraints].join('; ')
}

export interface RenderContext {
  /** The schema's `$id`, which the page's `$ref` example starts with. */
  schemaId: string
  /** Every definition in the schema. With it, the page lists which definitions use this one. */
  defs?: Record<string, JsonSchema>
}

/** The page for one definition, frontmatter included. */
export function renderDefinition(
  name: string,
  def: JsonSchema,
  { schemaId, defs = {} }: RenderContext
): string {
  const description = def['description']
  if (typeof description !== 'string' || !description.trim())
    throw new Error(`${name} has no description`)
  const slug = slugFor(name)
  const props = properties(def)
  for (const [field, prop] of Object.entries(props)) {
    if (typeof prop['description'] !== 'string' || !prop['description'].trim())
      throw new Error(`${name}.${field} has no description`)
  }

  const title = JSON.stringify(searchTitle(name, def))
  const out: string[] = [
    '---',
    `title: ${name}`,
    `description: ${JSON.stringify(searchDescription(name, def, description))}`,
    // Search results and link previews show more than the bare definition name.
    'head:',
    '  - tag: title',
    `    content: ${title}`,
    '  - tag: meta',
    '    attrs:',
    '      property: og:title',
    `      content: ${title}`,
    // The page is generated, so there is no file on GitHub to edit.
    'editUrl: false',
    '---',
    '',
    prose(description),
    '',
    '## Use it',
    '',
    '```json',
    JSON.stringify({ $ref: `${schemaId}#/$defs/${name}` }, null, 2),
    '```',
    '',
  ]

  const xfdf = def['x-xfdf']
  if (typeof xfdf === 'string') out.push(`XFDF element: \`${xfdf}\``, '')
  else if (groupFor(name, def) === 'Annotation types')
    out.push('XFDF element: none. This type is an extension; XFDF has no equivalent.', '')

  const required = new Set(
    Array.isArray(def['required']) ? (def['required'] as string[]) : []
  )
  if (Object.keys(props).length > 0) {
    out.push('## Fields', '')
    if (required.size > 0) out.push('Required fields are bracketed.', '')
    out.push(
      '| Field | Type | Default | XFDF | Description |',
      '| --- | --- | --- | --- | --- |'
    )
    for (const [field, prop] of Object.entries(props)) {
      // The brackets are drawn by the site's CSS; the hidden text says the same to a screen reader.
      const name = required.has(field)
        ? `<span class="required">${code(field)}<span class="sr-only"> (required)</span></span>`
        : code(field)
      const cells = [
        name,
        typeCell(field, prop, slug),
        'default' in prop ? code(JSON.stringify(prop['default'])) : '',
        typeof prop['x-xfdf'] === 'string' ? code(prop['x-xfdf']) : '—',
        prose(prop['description'] as string),
      ]
      out.push(`| ${cells.map(cell).join(' | ')} |`)
    }
    out.push('')
  }

  const members = Array.isArray(def['oneOf']) ? (def['oneOf'] as JsonSchema[]) : undefined
  if (members?.every((m) => typeof m['$ref'] === 'string')) {
    out.push('## Types', '', `The \`type\` field picks one of these:`, '')
    for (const member of members) {
      const target = refName(member['$ref'] as string)
      const type = defs[target] && properties(defs[target])['type']?.['const']
      out.push(
        `- ${link(target, slug)}${type === undefined ? '' : `: ${code(JSON.stringify(type))}`}`
      )
    }
    out.push('')
  } else if (Object.keys(props).length === 0) {
    out.push('## Type', '', describeType(def, slug), '')
  }

  const examples = Array.isArray(def['examples']) ? (def['examples'] as unknown[]) : []
  if (examples.length > 0) {
    out.push(examples.length === 1 ? '## Example' : '## Examples', '')
    for (const example of examples)
      out.push('```json', JSON.stringify(example, null, 2), '```', '')
  }

  const users = usedBy(name, defs)
  if (users.length > 0) {
    out.push('## Used by', '')
    for (const user of users) out.push(`- ${link(user, slug)}`)
    out.push('')
  }

  return out.join('\n')
}

/**
 * The Type cell. A `type` that excludes the defined types (UnknownAnnotation's) points at the
 * Annotation union rather than listing every value.
 */
function typeCell(field: string, prop: JsonSchema, slug: string): string {
  const not = prop['not'] as JsonSchema | undefined
  if (field === 'type' && Array.isArray(not?.['enum']))
    return `any string except a type Gloss defines (see ${link('Annotation', slug)})`
  return describeType(prop, slug)
}

/** The definitions, other than `name` itself, whose schema refers to `name` anywhere. */
function usedBy(name: string, defs: Record<string, JsonSchema>): string[] {
  const target = `#/$defs/${name}`
  return Object.entries(defs)
    .filter(([other, def]) => other !== name && refersTo(def, target))
    .map(([other]) => other)
}

function refersTo(node: unknown, target: string): boolean {
  if (Array.isArray(node)) return node.some((item) => refersTo(item, target))
  if (!node || typeof node !== 'object') return false
  // Examples are data, not schema.
  return Object.entries(node).some(([key, value]) =>
    key === '$ref' ? value === target : key !== 'examples' && refersTo(value, target)
  )
}

interface Described {
  base: string
  constraints: string[]
}

function describe(node: JsonSchema, fromSlug: string): Described {
  if (typeof node['$ref'] === 'string')
    return { base: link(refName(node['$ref']), fromSlug), constraints: [] }

  const alternatives = (node['anyOf'] ?? node['oneOf']) as JsonSchema[] | undefined
  if (Array.isArray(alternatives)) {
    const set = valueSet(node)
    if (set) {
      const [known, other] = set
      return {
        base: String(known['type']),
        constraints: [
          `known values ${values(known['enum'] as unknown[])}`,
          `any other value matches ${code(other['pattern'])}`,
        ],
      }
    }
    const parts = alternatives.map((alt) => describeType(alt, fromSlug))
    return { base: parts.join(' or '), constraints: [] }
  }

  const constraints: string[] = []
  let base: string
  if (node['type'] === 'array') {
    const items = (node['items'] ?? {}) as JsonSchema
    const inner = describe(items, fromSlug)
    base = `${/ or /.test(inner.base) ? `(${inner.base})` : inner.base}[]`
    const min = node['minItems']
    const max = node['maxItems']
    if (typeof min === 'number' && typeof max === 'number')
      constraints.push(`${min} to ${max} items`)
    else if (typeof min === 'number') constraints.push(`at least ${plural(min, 'item')}`)
    else if (typeof max === 'number') constraints.push(`at most ${plural(max, 'item')}`)
    // A constraint that already starts with "each" is about the innermost values; keep it.
    for (const constraint of inner.constraints)
      constraints.push(constraint.startsWith('each ') ? constraint : `each ${constraint}`)
  } else {
    base = typeof node['type'] === 'string' ? node['type'] : 'any'
    if (Array.isArray(node['type'])) base = (node['type'] as string[]).join(' or ')
  }

  if ('const' in node) constraints.push(`always ${code(JSON.stringify(node['const']))}`)
  if (Array.isArray(node['enum']))
    constraints.push(`one of ${values(node['enum'] as unknown[])}`)
  const not = node['not'] as JsonSchema | undefined
  if (Array.isArray(not?.['enum']))
    constraints.push(`not ${values(not['enum'] as unknown[])}`)

  constraints.push(...range(node))

  if (typeof node['minLength'] === 'number')
    constraints.push(`at least ${plural(node['minLength'], 'character')}`)
  if (typeof node['maxLength'] === 'number')
    constraints.push(`at most ${plural(node['maxLength'], 'character')}`)

  // zod writes a format's own check as a pattern too. The format says it more readably, and a
  // validator that skips formats still checks the pattern.
  if (node['format'] === 'date-time')
    constraints.push(
      `format ${code('date-time')} (RFC 3339 with seconds and an offset, e.g. ${code('2026-10-20T09:30:00Z')})`
    )
  else if (typeof node['format'] === 'string')
    constraints.push(`format ${code(node['format'])}`)
  else if (typeof node['pattern'] === 'string')
    constraints.push(`matches ${code(node['pattern'])}`)

  return { base, constraints }
}

/** Known values plus any other value matching a pattern, as the PDF name sets are written. */
function valueSet(
  node: JsonSchema
): [JsonSchema, JsonSchema & { pattern: string }] | undefined {
  const alternatives = node['anyOf']
  if (!Array.isArray(alternatives) || alternatives.length !== 2) return undefined
  const [known, other] = alternatives as JsonSchema[]
  return Array.isArray(known?.['enum']) &&
    typeof other?.['pattern'] === 'string' &&
    known['type'] === other['type']
    ? [known, other as JsonSchema & { pattern: string }]
    : undefined
}

function range(node: JsonSchema): string[] {
  const bound = (key: string): number | undefined => {
    const value = node[key]
    return typeof value === 'number' && !SAFE_INTEGER_BOUNDS.has(value)
      ? value
      : undefined
  }
  const min = bound('minimum')
  const max = bound('maximum')
  const exclusiveMin = bound('exclusiveMinimum')
  const exclusiveMax = bound('exclusiveMaximum')
  if (min !== undefined && max !== undefined) return [`${min} to ${max}`]
  const out: string[] = []
  if (min !== undefined) out.push(`≥ ${min}`)
  if (exclusiveMin !== undefined) out.push(`> ${exclusiveMin}`)
  if (max !== undefined) out.push(`≤ ${max}`)
  if (exclusiveMax !== undefined) out.push(`< ${exclusiveMax}`)
  return out
}

export function properties(def: JsonSchema): Record<string, JsonSchema> {
  const props = def['properties']
  return props && typeof props === 'object' ? (props as Record<string, JsonSchema>) : {}
}

function refName(ref: string): string {
  const match = /^#\/\$defs\/(.+)$/.exec(ref)
  if (!match) throw new Error(`unsupported $ref ${ref}`)
  return match[1]
}

function link(name: string, fromSlug: string): string {
  const slug = slugFor(name)
  return slug === fromSlug ? name : `[${name}](../${slug}/)`
}

function values(list: unknown[]): string {
  return list.map((value) => code(JSON.stringify(value))).join(', ')
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

/** `Note annotation: JSON Schema | Gloss`, or `Rect: JSON Schema | Gloss` for anything else. */
function searchTitle(name: string, def: JsonSchema): string {
  const kind = groupFor(name, def) === 'Annotation types' ? ' annotation' : ''
  return `${name}${kind}: JSON Schema | Gloss`
}

/** The definition's first sentence, then what the page covers, for search results. */
function searchDescription(name: string, def: JsonSchema, description: string): string {
  const covers =
    groupFor(name, def) === 'Annotation types'
      ? `The fields, defaults and XFDF names of the ${name} annotation`
      : `Reference for ${name}`
  return `${firstSentence(description)} ${covers} in Gloss, a JSON format for PDF annotations.`
}

function firstSentence(text: string): string {
  return /^.*?[.!?](?=\s|$)/s.exec(text)?.[0] ?? text
}

/** A code span, with a fence longer than any run of backticks in the text. */
export function code(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length))
  const fence = '`'.repeat(longest + 1)
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${text}${pad}${fence}`
}

/** Schema prose as Markdown text: characters Markdown would read as syntax are escaped. */
export function prose(text: string): string {
  return text.replace(/[\\`*_<>[\]]/g, '\\$&')
}

/** A table cell: pipes escaped, line breaks folded. GFM unescapes `\|` inside code spans too. */
export function cell(text: string): string {
  return text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')
}
