# Intent

> What a mark is for, such as a callout or an arrow (XFDF intent, PDF /IT). Reference for Intent in Gloss, a JSON format for PDF annotations.

What a mark is for, such as a callout or an arrow (XFDF intent, PDF /IT). One of FreeText, FreeTextCallout, FreeTextTypeWriter, LineArrow, LineDimension, PolygonCloud, PolygonDimension, PolyLineDimension. Any other PDF name is allowed and is kept unchanged.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Intent"
}
```

## Type

string; known values `"FreeText"`, `"FreeTextCallout"`, `"FreeTextTypeWriter"`, `"LineArrow"`, `"LineDimension"`, `"PolygonCloud"`, `"PolygonDimension"`, `"PolyLineDimension"`; any other value matches `^[^\s()<>[\]{}/%]+$`

## Used by

- [Highlight](https://gloss-format.org/reference/highlight/)
- [Underline](https://gloss-format.org/reference/underline/)
- [Strikeout](https://gloss-format.org/reference/strikeout/)
- [Squiggly](https://gloss-format.org/reference/squiggly/)
- [Note](https://gloss-format.org/reference/note/)
- [FreeText](https://gloss-format.org/reference/free-text/)
- [Square](https://gloss-format.org/reference/square/)
- [Circle](https://gloss-format.org/reference/circle/)
- [Line](https://gloss-format.org/reference/line/)
- [Polyline](https://gloss-format.org/reference/polyline/)
- [Polygon](https://gloss-format.org/reference/polygon/)
- [Ink](https://gloss-format.org/reference/ink/)
- [Stamp](https://gloss-format.org/reference/stamp/)
- [Loupe](https://gloss-format.org/reference/loupe/)
- [Mask](https://gloss-format.org/reference/mask/)
- [Redact](https://gloss-format.org/reference/redact/)
- [Common](https://gloss-format.org/reference/common/)
