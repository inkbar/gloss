import schema from 'gloss-format/schema.json' with { type: 'json' }
import { describe, expect, it } from 'vitest'

import { renderLlms } from './llms.ts'

const groups = [
  {
    label: 'Annotation types' as const,
    items: [{ label: 'Redact', slug: 'reference/redact' }],
  },
]
const text = renderLlms(schema, groups)

describe('renderLlms', () => {
  it('starts with the name and a summary', () => {
    expect(text).toMatch(/^# Gloss\n\n> An open JSON format for PDF annotations\./)
  })

  it('links the docs with production URLs', () => {
    expect(text).toContain('- [Gloss and XFDF](https://gloss-format.org/xfdf/): ')
    expect(text).toContain('- [JSON Schema](https://gloss-format.org/schema/v1.json): ')
    expect(text).toContain('- [Full text](https://gloss-format.org/llms-full.txt): ')
  })

  it('lists each reference page with its first sentence', () => {
    expect(text).toContain('## Reference: Annotation types')
    expect(text).toContain(
      '- [Redact](https://gloss-format.org/reference/redact/): A mark over content to be removed.'
    )
  })
})
