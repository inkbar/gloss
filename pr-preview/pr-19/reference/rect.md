# Rect

> A rectangle in PDF user space, given by its bottom-left corner and its size. Reference for Rect in Gloss, a JSON format for PDF annotations.

A rectangle in PDF user space, given by its bottom-left corner and its size. XFDF writes it as x1,y1,x2,y2.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Rect"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `x` (required) | number |  | — | Left edge in points. |
| `y` (required) | number |  | — | Bottom edge in points. |
| `width` (required) | number; ≥ 0 |  | — | Width in points. |
| `height` (required) | number; ≥ 0 |  | — | Height in points. |

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
- [Redact](https://gloss-format.org/reference/redact/)
- [Common](https://gloss-format.org/reference/common/)
