# Fringe

> Insets from an annotation's rect to the area it draws in, in points (PDF /RD, XFDF fringe, both in this order). Reference for Fringe in Gloss, a JSON format for PDF annotations.

Insets from an annotation's rect to the area it draws in, in points (PDF /RD, XFDF fringe, both in this order).

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Fringe"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `left` (required) | number; ≥ 0 |  | — | Inset from the left edge in points. |
| `top` (required) | number; ≥ 0 |  | — | Inset from the top edge in points. |
| `right` (required) | number; ≥ 0 |  | — | Inset from the right edge in points. |
| `bottom` (required) | number; ≥ 0 |  | — | Inset from the bottom edge in points. |

## Used by

- [FreeText](https://gloss-format.org/reference/free-text/)
