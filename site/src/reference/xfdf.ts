/**
 * Renders the page that maps XFDF to Gloss: the Gloss type for each XFDF element and the Gloss
 * field for each XFDF attribute, from the schema's `x-xfdf` names. Pure, like `render.ts`.
 */
import {
  cell,
  code,
  groupFor,
  properties,
  prose,
  slugFor,
  type JsonSchema,
} from './render.ts'

const TITLE = 'XFDF to JSON: how XFDF annotations map to Gloss'

export function renderXfdf(schema: JsonSchema): string {
  const defs = (schema['$defs'] ?? {}) as Record<string, JsonSchema>
  const common = properties(defs['Common'] ?? {})
  const types = Object.entries(defs).filter(
    ([name, def]) => groupFor(name, def) === 'Annotation types'
  )
  const mapped = types.filter(([, def]) => typeof def['x-xfdf'] === 'string')
  const extensions = types.filter(([, def]) => typeof def['x-xfdf'] !== 'string')

  const out = [
    '---',
    'title: Gloss and XFDF',
    `description: ${JSON.stringify('How XFDF maps to JSON in Gloss: the Gloss type for every XFDF annotation element and the Gloss field for every XFDF attribute, with how each value is written.')}`,
    'head:',
    '  - tag: title',
    `    content: ${JSON.stringify(TITLE)}`,
    '  - tag: meta',
    '    attrs:',
    '      property: og:title',
    `      content: ${JSON.stringify(TITLE)}`,
    // The page is generated, so there is no file on GitHub to edit.
    'editUrl: false',
    '---',
    '',
    'XFDF is the XML format for PDF annotations, standardised as ISO 19444-1. Gloss carries the same annotations as JSON. This page lists the Gloss type for each XFDF element and the Gloss field for each XFDF attribute, generated from the names the schema records, so it matches `v1.json`.',
    '',
    '## Elements',
    '',
    '| XFDF element | Gloss type |',
    '| --- | --- |',
    ...mapped.map(
      ([name, def]) =>
        `| ${code(`<${def['x-xfdf'] as string}>`)} | ${typeLink(name, def)} |`
    ),
    '',
  ]
  if (extensions.length > 0) {
    out.push(
      `${extensions.map(([name, def]) => typeLink(name, def)).join(' and ')} ${extensions.length === 1 ? 'is an extension' : 'are extensions'}, with no XFDF element.`,
      ''
    )
  }

  out.push(
    '## Attributes on every annotation',
    '',
    'Every element takes these. The element name gives the Gloss `type`.',
    '',
    ...fieldTable(common, defs, 'common'),
    ''
  )

  for (const [name, def] of mapped) {
    const own = Object.fromEntries(
      Object.entries(properties(def)).filter(([field]) => !(field in common))
    )
    if (Object.keys(own).length === 0) continue
    out.push(
      `## ${code(`<${def['x-xfdf'] as string}>`)}`,
      '',
      ...fieldTable(own, defs, slugFor(name)),
      ''
    )
  }

  const fields = properties(defs['Document'] ?? {})['fields']
  if (fields && typeof fields['x-xfdf'] === 'string') {
    out.push(
      '## Form fields',
      '',
      `The XFDF ${code(`<${fields['x-xfdf']}>`)} element holds the values of the form fields. Gloss writes them in the document's [${code('fields')}](../reference/document/) property: an object keyed by full dotted field name, in place of one ${code('<field>')} element per name. XFDF nests ${code('<field>')} elements for a field hierarchy; Gloss joins the nested names with ${code('.')}, so a ${code('<field name="b">')} inside ${code('<field name="a">')} becomes ${code('"a.b"')}. A field that is absent from ${code('fields')} differs from one set to an empty string: absent means no value is carried, while an empty string clears the field. A string fills a text, checkbox, radio, combo or single-select list field. An array of strings fills a multi-select list. An object with a ${code('signature')} key names a signature annotation in the same document.`,
      '',
      '| XFDF | Gloss |',
      '| --- | --- |',
      `| ${code('<field name="a.b"><value>x</value></field>')} | ${code('"a.b": "x"')} |`,
      `| ${code('<field name="c"><value>x</value><value>y</value></field>')} | ${code('"c": ["x", "y"]')} |`,
      '',
      `See [${code('Fields')}](../reference/fields/), [${code('FieldValue')}](../reference/field-value/) and [${code('SignatureFieldValue')}](../reference/signature-field-value/).`,
      ''
    )
  }

  return out.join('\n')
}

function typeLink(name: string, def: JsonSchema): string {
  const type = properties(def)['type']?.['const']
  return `[${code(String(type))}](../reference/${slugFor(name)}/)`
}

/** One row per field: its XFDF name, the Gloss field and what the descriptions say about XFDF. */
function fieldTable(
  props: Record<string, JsonSchema>,
  defs: Record<string, JsonSchema>,
  slug: string
): string[] {
  const rows = Object.entries(props)
    .filter(([field]) => field !== 'type')
    .map(([field, prop]) => {
      const xfdf =
        typeof prop['x-xfdf'] === 'string'
          ? code(prop['x-xfdf'])
          : namesPdfKey(prop)
            ? 'none'
            : 'none, an extension'
      const notes = xfdfSentences(prop, defs)
      return `| ${[xfdf, `[${code(field)}](../reference/${slug}/)`, notes].map(cell).join(' | ')} |`
    })
  return ['| XFDF | Gloss | Notes |', '| --- | --- | --- |', ...rows]
}

/** True when the description says where the value lives in PDF, as in "written to PDF /Border". */
function namesPdfKey(prop: JsonSchema): boolean {
  return (
    typeof prop['description'] === 'string' && /\bPDF \/[A-Z]/.test(prop['description'])
  )
}

/** The sentences of a field's description, and of the definition it refers to, that mention XFDF. */
function xfdfSentences(prop: JsonSchema, defs: Record<string, JsonSchema>): string {
  const ref =
    typeof prop['$ref'] === 'string'
      ? /#\/\$defs\/(.+)$/.exec(prop['$ref'])?.[1]
      : undefined
  const texts = [prop['description'], ref ? defs[ref]?.['description'] : undefined]
  return texts
    .filter((text): text is string => typeof text === 'string')
    .flatMap((text) => text.split(/(?<=[.!?])\s+/))
    .filter(
      (sentence) => /\bXFDF\b/.test(sentence) && !/XFDF has no equivalent/.test(sentence)
    )
    .map(prose)
    .join(' ')
}
