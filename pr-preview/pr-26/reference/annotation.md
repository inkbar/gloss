# Annotation

> Any annotation type Gloss defines, chosen by its type field. Reference for Annotation in Gloss, a JSON format for PDF annotations.

Any annotation type Gloss defines, chosen by its type field.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Annotation"
}
```

## Types

The `type` field picks one of these:

- [Highlight](https://gloss-format.org/reference/highlight/): `"highlight"`
- [Underline](https://gloss-format.org/reference/underline/): `"underline"`
- [Strikeout](https://gloss-format.org/reference/strikeout/): `"strikeout"`
- [Squiggly](https://gloss-format.org/reference/squiggly/): `"squiggly"`
- [Note](https://gloss-format.org/reference/note/): `"text"`
- [FreeText](https://gloss-format.org/reference/free-text/): `"freetext"`
- [Square](https://gloss-format.org/reference/square/): `"square"`
- [Circle](https://gloss-format.org/reference/circle/): `"circle"`
- [Line](https://gloss-format.org/reference/line/): `"line"`
- [Polyline](https://gloss-format.org/reference/polyline/): `"polyline"`
- [Polygon](https://gloss-format.org/reference/polygon/): `"polygon"`
- [Ink](https://gloss-format.org/reference/ink/): `"ink"`
- [Stamp](https://gloss-format.org/reference/stamp/): `"stamp"`
- [Redact](https://gloss-format.org/reference/redact/): `"redact"`

## Used by

- [Document](https://gloss-format.org/reference/document/)
