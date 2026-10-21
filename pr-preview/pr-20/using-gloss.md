# Using Gloss in your schemas

> Build your API schemas on Gloss. Refer to Gloss definitions by URL, require the fields your system needs, and validate documents against them.

Gloss defines what annotation data means and leaves each system to decide what it accepts. You set that in your own schemas, which can point at Gloss definitions instead of copying them.

## Validate a document

1. Install the package: `npm install gloss-format`.
2. Import `GlossDocument` from `gloss-format` and call `GlossDocument.safeParse` on the parsed JSON.
3. If `success` is false, `error.issues` lists each problem and where it is. If it is true, `data` holds the document with every default filled in.

## Refer to a definition by URL

Every definition has a URL: the schema's `$id`, then a JSON pointer into `$defs`. The redaction definition is at `https://gloss-format.org/schema/v1.json#/$defs/Redact`. Put that URL in a `$ref` and you get the definition with all its fields and descriptions. Each [reference page](https://gloss-format.org/reference/redact/) shows its URL.

Load the [Gloss schema](https://gloss-format.org/schema/v1.json) into your validator before you compile your own. The URLs then resolve with no network request.

## Set your own contract

Gloss requires as little as it can, so that any system can read the data. Your API can ask for more. Wrap a Gloss definition in `allOf` and add your rules beside it.

This schema is for an API that needs to know who made each redaction and when. It makes `author` and `createdAt` required, so the API turns away a redaction that lacks either:

audited-redaction.schema.json:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.example.com/schemas/audited-redaction.json",
  "title": "Audited redaction",
  "description": "A Gloss redaction that says who made it and when.",
  "allOf": [{ "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Redact" }],
  "required": ["author", "createdAt"]
}
```

The rest comes from Gloss. A redaction with no `rect` still fails, because Gloss requires one.

You can narrow an enum or add a pattern to any field the same way. To turn away fields Gloss doesn't list, give the names you accept in `propertyNames`. `unevaluatedProperties: false` won't do it, because Gloss definitions accept any extra field and so count every field as evaluated.

## OpenAPI 3.1

OpenAPI 3.1 uses JSON Schema 2020-12, so a response can point at a Gloss definition. This one returns a document's redactions as a list of `Redact`:

openapi.json:

```json
{
  "openapi": "3.1.0",
  "info": { "title": "Documents API", "version": "1.0.0" },
  "paths": {
    "/documents/{id}/redactions": {
      "get": {
        "summary": "List a document's redactions",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "The redactions on the document, in drawing order.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Redact"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

The list isn't a Gloss document, so it goes out as plain `application/json`. Use `application/vnd.gloss.annotations+json` for a body that is a whole document, with `format`, `version` and `annotations`.

If your OpenAPI tools can't fetch remote references, bundle the Gloss schema into your API description first.

## TypeScript with zod

The `gloss-format` package exports a zod schema for every definition, with a TypeScript type of the same name. The schema for a whole document is `GlossDocument`.

validate-zod.ts:

```ts
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
console.log(redaction.opacity) // 1, the default
```

Parsing keeps fields Gloss doesn't define, and keeps items of a type it doesn't know. It also fills in defaults, so a redaction with no `opacity` comes back with `opacity: 1`.

So each definition has two types. `Redact` is what a parse returns, with every default filled in. `RedactInput` is what you write, where fields with a default are optional. Use the `Input` type for data you build before you parse or send it. `isAnnotation(item)` tells you whether a document item is a type Gloss defines, and narrows its type.

## Any JSON Schema validator

The schema is plain JSON Schema 2020-12, so a validator for that draft can use it. Register the schema under its `$id`, then validate a whole document or any one definition. Gloss gives XFDF names in its own `x-xfdf` keyword; a strict validator needs to be told about it. This sample uses Ajv in its default strict mode:

validate-ajv.ts:

```ts
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
```

`gloss-format/schema.json` in the package is the same file as `https://gloss-format.org/schema/v1.json`.
