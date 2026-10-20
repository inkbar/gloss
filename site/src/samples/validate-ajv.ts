import { readFileSync } from 'node:fs'

import { Ajv2020 } from 'ajv/dist/2020.js'
import glossSchema from 'gloss-format/schema.json' with { type: 'json' }

// Timestamps carry format: date-time and a pattern. Ajv checks the pattern either
// way; leave formats off, or add ajv-formats to check them too.
const ajv = new Ajv2020({ validateFormats: false })

// Gloss gives XFDF names in its own x-xfdf keyword. Declare it so strict mode
// accepts it.
ajv.addKeyword('x-xfdf')

// Register the schema under its $id, so references to the URL resolve without
// a network request.
ajv.addSchema(glossSchema)

const validateDocument = ajv.getSchema('https://gloss-format.org/schema/v1.json')!
const text = readFileSync(new URL('./minimal.gloss.json', import.meta.url), 'utf8')
if (!validateDocument(JSON.parse(text))) {
  throw new Error(ajv.errorsText(validateDocument.errors))
}

// Any one definition is reachable by its URL.
const validateRedact = ajv.compile({
  $ref: 'https://gloss-format.org/schema/v1.json#/$defs/Redact',
})
const ok = validateRedact({
  type: 'redact',
  id: 'r1',
  page: 0,
  rect: { x: 72, y: 700, width: 120, height: 14 },
})
console.log(ok) // true
