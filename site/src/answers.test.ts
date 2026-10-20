import { ANNOTATION_TYPES } from 'gloss-format'
import { describe, expect, it } from 'vitest'

import { inlineHtml, jsonLd, plainText, QUESTIONS } from './answers.ts'

describe('QUESTIONS', () => {
  it('names every annotation type Gloss defines', () => {
    const types = QUESTIONS.find((q) => q.question.startsWith('Which annotation types'))
    for (const type of ANNOTATION_TYPES) expect(types?.answer).toContain(`\`${type}\``)
  })

  it('keeps each answer short enough to quote', () => {
    for (const { answer } of QUESTIONS) {
      const words = plainText(answer).split(/\s+/).length
      expect(words, answer).toBeLessThanOrEqual(70)
    }
  })
})

describe('inline Markdown', () => {
  it('renders code and links, escaping the rest', () => {
    expect(inlineHtml('a `<b>` and [c](d/)')).toBe(
      'a <code>&lt;b&gt;</code> and <a href="d/">c</a>'
    )
  })

  it('flattens to plain text', () => {
    expect(plainText('a `b` and [c](d/)')).toBe('a b and c')
  })

  it('keeps a script element closed', () => {
    expect(jsonLd({ text: '</script>' })).toBe('{"text":"\\u003c/script>"}')
  })
})
