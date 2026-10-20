# gloss-format

Gloss is a JSON format for PDF annotations. A document lists highlights, notes, shapes and redactions by page and position, so one tool can write annotations and another can read them back.

This package holds the JSON Schema, a zod schema and TypeScript type for every definition, and the format constants. The format is described at [gloss-format.org](https://gloss-format.org).

## Install

```sh
npm install gloss-format
```

Gloss files use the `.gloss.json` extension and the `application/vnd.gloss.annotations+json` media type. Both are exported as constants (`GLOSS_MEDIA_TYPE`, `GLOSS_FORMAT`, `GLOSS_VERSION`, `GLOSS_SCHEMA_ID`).

## Validate with zod

```ts
import { GlossDocument } from 'gloss-format'

const result = GlossDocument.safeParse(JSON.parse(text))

if (result.success) {
  for (const annotation of result.data.annotations) {
    console.log(annotation.type, annotation.page)
  }
} else {
  console.error(result.error.issues)
}
```

Every definition is exported as a zod schema with a type of the same name, such as `Redact`, `Highlight` and `Annotation`. Fields a type does not define pass through unchanged. An item whose `type` is not one Gloss knows is kept as an unknown annotation. An item with a known `type` and invalid fields fails.

## Validate with Ajv

```ts
import { Ajv2020 } from 'ajv/dist/2020.js'
import schema from 'gloss-format/schema.json' with { type: 'json' }

const ajv = new Ajv2020({ strict: false, validateFormats: false })
const validate = ajv.compile(schema)

if (!validate(JSON.parse(text))) {
  console.error(validate.errors)
}
```

The schema is JSON Schema draft 2020-12. `validateFormats: false` skips the `date-time` check on timestamps; add `ajv-formats` if you want it.

## Refer to a definition by URL

Other schemas can point at a single definition. This one requires `author` on a redaction:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Redact",
  "required": ["author"]
}
```

Load `gloss-format/schema.json` into your validator first so the URL resolves without a network request. With Ajv, call `ajv.addSchema(schema)` before compiling.

## Licence

MIT
