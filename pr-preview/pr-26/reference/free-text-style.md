# FreeTextStyle

> A free-text box's text style. Reference for FreeTextStyle in Gloss, a JSON format for PDF annotations.

A free-text box's text style. The keys are the CSS property names XFDF writes in its defaultstyle string, in camel case.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/FreeTextStyle"
}
```

## Fields

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `fontFamily` | string; at least 1 character | `"Helvetica"` | — | The font family. Absent means Helvetica. XFDF writes it as font-family. |
| `fontSize` | number; > 0 | `12` | — | The font size in points. Absent means 12. XFDF writes it as font-size. |
| `color` | [Color](https://gloss-format.org/reference/color/) |  | — | The text colour. Absent: the reader chooses the text colour. |
| `textAlign` | string; one of `"left"`, `"center"`, `"right"`, `"justify"` | `"left"` | — | How lines of text line up in the box. Absent means left. XFDF writes it as text-align. |
| `fontWeight` | string; always `"bold"` |  | — | Bold text. Absent means normal weight. XFDF writes it as font-weight. |
| `fontStyle` | string; always `"italic"` |  | — | Italic text. Absent means upright. XFDF writes it as font-style. |
| `textDecoration` | string; always `"underline"` |  | — | Underlined text. Absent means no underline. XFDF writes it as text-decoration. |

## Example

```json
{
  "fontFamily": "Helvetica",
  "fontSize": 12,
  "color": "#1A1A1A"
}
```

## Used by

- [FreeText](https://gloss-format.org/reference/free-text/)
