import schema from 'gloss-format/schema.json' with { type: 'json' }
import { describe, expect, it } from 'vitest'

import { renderXfdf } from './xfdf.ts'

const page = renderXfdf(schema)

describe('renderXfdf', () => {
  it('has a search title and a description', () => {
    expect(page).toMatch(/^---\ntitle: Gloss and XFDF\ndescription: ".+"\nhead:\n/)
    expect(page).toContain(
      '    content: "XFDF to JSON: how XFDF annotations map to Gloss"'
    )
  })

  it('maps each XFDF element to its Gloss type', () => {
    expect(page).toContain('| `<text>` | [`text`](../reference/note/) |')
    expect(page).toContain('| `<redact>` | [`redact`](../reference/redact/) |')
  })

  it('has an element for every type', () => {
    expect(page).not.toContain('with no XFDF element')
  })

  it('maps the attributes every annotation takes, with what XFDF writes', () => {
    expect(page).toContain('| `title` | [`author`](../reference/common/) |')
    expect(page).toMatch(
      /\| `rect` \| \[`rect`\]\(\.\.\/reference\/common\/\) \| .*x1,y1,x2,y2/
    )
    expect(page).not.toContain('[`type`](../reference/common/)')
  })

  it('maps the attributes of each element, and marks extensions', () => {
    expect(page).toContain('## `<redact>`')
    expect(page).toContain('| `overlay-text` | [`overlayText`](../reference/redact/) |')
    expect(page).toContain('| none, an extension | [`custom`](../reference/common/) |  |')
  })
})
