# Quad

> A quadrilateral over a run of text, its corners in the order PDF uses for /QuadPoints. Reference for Quad in Gloss, a JSON format for PDF annotations.

A quadrilateral over a run of text, its corners in the order PDF uses for /QuadPoints. It need not be axis-aligned.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Quad"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `p1` (required) | [Point](https://gloss-format.org/reference/point/) |  | — | Top-left corner. |
| `p2` (required) | [Point](https://gloss-format.org/reference/point/) |  | — | Top-right corner. |
| `p3` (required) | [Point](https://gloss-format.org/reference/point/) |  | — | Bottom-left corner. |
| `p4` (required) | [Point](https://gloss-format.org/reference/point/) |  | — | Bottom-right corner. |

## Used by

- [Highlight](https://gloss-format.org/reference/highlight/)
- [Underline](https://gloss-format.org/reference/underline/)
- [Strikeout](https://gloss-format.org/reference/strikeout/)
- [Squiggly](https://gloss-format.org/reference/squiggly/)
- [Redact](https://gloss-format.org/reference/redact/)
