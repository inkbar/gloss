# Fields

> Form field values, keyed by full dotted field name, such as applicant.name. Reference for Fields in Gloss, a JSON format for PDF annotations.

Form field values, keyed by full dotted field name, such as applicant.name. A key that is absent means the document does not state that field. An empty string means the field is empty.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Fields"
}
```

XFDF element: `fields/field`

## Type

object

## Example

```json
{
  "applicant.name": "Ada",
  "applicant.newsletter": "Yes",
  "interests": [
    "maths",
    "engines"
  ],
  "applicant.signature": {
    "signature": "a7"
  }
}
```

## Used by

- [Document](https://gloss-format.org/reference/document/)
