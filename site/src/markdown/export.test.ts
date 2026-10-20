import { describe, expect, it } from 'vitest'

import { toMarkdown } from './export.ts'

const context = {
  url: 'https://gloss-format.org/reference/redact/',
  readSample: (path: string) => (path === './a.json' ? '{ "a": 1 }\n' : 'never'),
}

describe('toMarkdown', () => {
  it('starts with the title and the description', () => {
    expect(
      toMarkdown({ title: 'Redact', description: 'A `mark`.', body: 'Text.' }, context)
    ).toBe('# Redact\n\n> A mark.\n\nText.\n')
  })

  it('inlines imported samples in place of Code and Glossed', () => {
    const body = [
      "import { Code } from '@astrojs/starlight/components'",
      "import a from './a.json?raw'",
      '',
      '<Code code={a} lang="json" title="a.json" />',
      '',
      '<Glossed\n  code={a}\n  title="a.json"\n  notes={{ 1: \'note\' }}\n/>',
    ].join('\n')
    const md = toMarkdown({ title: 'T', body }, context)
    expect(md).not.toContain('import')
    expect(md.match(/a\.json:\n\n```json\n\{ "a": 1 \}\n```/g)).toHaveLength(2)
  })

  it('writes the questions and steps out as Markdown', () => {
    const md = toMarkdown(
      { title: 'T', body: '<Questions />\n\n<ValidationSteps />' },
      context
    )
    expect(md).toContain('### What is Gloss?\n\n')
    expect(md).toContain('1. Install the package: `npm install gloss-format`.')
  })

  it('says in words which fields are required', () => {
    const body =
      'Required fields are bracketed.\n\n| <span class="required">`x`<span class="sr-only"> (required)</span></span> | number |'
    const md = toMarkdown({ title: 'T', body }, context)
    expect(md).toContain('A field marked (required) must be present.')
    expect(md).toContain('| `x` (required) | number |')
  })

  it('makes relative links absolute, but not inside code', () => {
    const md = toMarkdown(
      {
        title: 'T',
        body: 'See [Rect](../rect/) and [x](https://x.test/).\n\n```md\n[k](../k/)\n```',
      },
      context
    )
    expect(md).toContain('[Rect](https://gloss-format.org/reference/rect/)')
    expect(md).toContain('[x](https://x.test/)')
    expect(md).toContain('[k](../k/)')
  })

  it('refuses a component it has no Markdown for', () => {
    expect(() => toMarkdown({ title: 'T', body: '<Aside />' }, context)).toThrow(/Aside/)
  })
})
