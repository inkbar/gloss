# Point

> A point in PDF user space: points, origin bottom-left, before /Rotate. Reference for Point in Gloss, a JSON format for PDF annotations.

A point in PDF user space: points, origin bottom-left, before /Rotate.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Point"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `x` (required) | number |  | — | Horizontal position in points. |
| `y` (required) | number |  | — | Vertical position in points, measured up from the bottom. |

## Used by

- [Quad](https://gloss-format.org/reference/quad/)
- [FreeText](https://gloss-format.org/reference/free-text/)
- [Line](https://gloss-format.org/reference/line/)
- [Polyline](https://gloss-format.org/reference/polyline/)
- [Polygon](https://gloss-format.org/reference/polygon/)
- [Ink](https://gloss-format.org/reference/ink/)
