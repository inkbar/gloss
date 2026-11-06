# FieldValue

> The value of one form field. Reference for FieldValue in Gloss, a JSON format for PDF annotations.

The value of one form field. A string fills a text, checkbox, radio, combo or single-select list field. Checkbox and radio values are appearance-state names, and "Off" is the unchecked state. An array of strings fills a multi-select list field, in option order. An object names a signature annotation. An empty string means the field is empty.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/FieldValue"
}
```

## Type

string or string[] or [SignatureFieldValue](https://gloss-format.org/reference/signature-field-value/)

## Examples

```json
"Ada"
```

```json
"Off"
```

```json
[
  "maths",
  "engines"
]
```

```json
{
  "signature": "a7"
}
```

## Used by

- [Fields](https://gloss-format.org/reference/fields/)
