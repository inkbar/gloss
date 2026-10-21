# LineEnding

> The shape drawn at the end of a line (XFDF head and tail, PDF /LE). Reference for LineEnding in Gloss, a JSON format for PDF annotations.

The shape drawn at the end of a line (XFDF head and tail, PDF /LE). One of None, Square, Circle, Diamond, OpenArrow, ClosedArrow, Butt, ROpenArrow, RClosedArrow, Slash. Any other PDF name is allowed and is kept unchanged.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/LineEnding"
}
```

## Type

string; known values `"None"`, `"Square"`, `"Circle"`, `"Diamond"`, `"OpenArrow"`, `"ClosedArrow"`, `"Butt"`, `"ROpenArrow"`, `"RClosedArrow"`, `"Slash"`; any other value matches `^[^\s()<>[\]{}/%]+$`

## Used by

- [FreeText](https://gloss-format.org/reference/free-text/)
- [Line](https://gloss-format.org/reference/line/)
- [Polyline](https://gloss-format.org/reference/polyline/)
