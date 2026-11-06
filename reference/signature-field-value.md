# SignatureFieldValue

> The value of a signature field. Reference for SignatureFieldValue in Gloss, a JSON format for PDF annotations.

The value of a signature field. It names a stamp or ink annotation with subject Signature in the same document, rather than holding the signature itself.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/SignatureFieldValue"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `signature` (required) | string; at least 1 character |  | — | The id of a stamp or ink annotation in the same document whose subject is Signature. That annotation is the signature's appearance. |

## Example

```json
{
  "signature": "a7"
}
```

## Used by

- [FieldValue](https://gloss-format.org/reference/field-value/)
