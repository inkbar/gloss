import { readFileSync } from 'node:fs'

import { GlossDocument, Redact } from 'gloss-format'

const text = readFileSync(new URL('./minimal.gloss.json', import.meta.url), 'utf8')

// Parse a whole document. Fields Gloss doesn't define are kept, and so are
// annotations of a type it doesn't define.
const result = GlossDocument.safeParse(JSON.parse(text))
if (!result.success) throw new Error(result.error.message)

for (const annotation of result.data.annotations) {
  console.log(annotation.type, annotation.id, 'on page', annotation.page)
}

// Or check one definition on its own. Every schema has a type of the same name.
const redaction: Redact = Redact.parse({
  type: 'redact',
  id: 'r1',
  page: 0,
  rect: { x: 72, y: 700, width: 120, height: 14 },
})
console.log(redaction.origin) // 'user', the default
