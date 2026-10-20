# FreeText

> Text drawn directly on the page in a box. The fields, defaults and XFDF names of the FreeText annotation in Gloss, a JSON format for PDF annotations.

Text drawn directly on the page in a box. color is the fill of the box and defaultStyle holds the text style.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/FreeText"
}
```

XFDF element: `freetext`

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `type` (required) | string; always `"freetext"` |  | — | The annotation type. Always freetext. |
| `id` (required) | string; at least 1 character |  | `name` | Unique within the document. Never reused for a different annotation. |
| `page` (required) | integer; ≥ 0 |  | `page` | The page the annotation is on, counted from 0. |
| `rect` (required) | [Rect](https://gloss-format.org/reference/rect/) |  | `rect` | The bounding box, in PDF user space. |
| `color` | [Color](https://gloss-format.org/reference/color/) |  | `color` | The box's fill. Absent means no fill. |
| `opacity` | number; 0 to 1 | `1` | `opacity` | Opacity, from 0 (invisible) to 1 (opaque). Absent means opaque. |
| `author` | string |  | `title` | Who made the annotation. Absent means unknown. |
| `contents` (required) | string |  | `contents` | The text shown on the page. |
| `inReplyTo` | string |  | `inreplyto` | The id of the annotation this one replies to. Replies form threads. Absent means the annotation is not a reply. |
| `createdAt` | string; format `date-time` (RFC 3339 with seconds and an offset, e.g. `2026-10-20T09:30:00Z`) |  | `creationdate` | When the annotation was made, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string (D:20261019120000Z). Absent means unknown. |
| `modifiedAt` | string; format `date-time` (RFC 3339 with seconds and an offset, e.g. `2026-10-20T09:30:00Z`) |  | `date` | When the annotation last changed, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string. Absent means unknown. |
| `subject` | string |  | `subject` | A short label for what the mark is. Absent means no label. |
| `intent` | [Intent](https://gloss-format.org/reference/intent/) |  | `intent` | What the mark is for, such as a callout or an arrow. Absent means the type's plain form. |
| `custom` | object |  | — | Data of your own. Gloss readers keep it as it is and never interpret it. Absent means none. |
| `borderColor` | [Color](https://gloss-format.org/reference/color/) |  | — | The border's colour. Absent: the reader chooses the colour. An extension; XFDF has no equivalent. |
| `width` | number; ≥ 0 | `0` | `width` | The border's width in points; 0 draws no border. Absent means 0. |
| `dashes` | [Dashes](https://gloss-format.org/reference/dashes/) |  | `dashes` | The dash pattern of the stroke. Absent means a solid line. |
| `cornerRadius` | number; ≥ 0 |  | — | The radius of the box's corners in points. Absent means square corners. An extension; XFDF has no equivalent. |
| `defaultStyle` | [FreeTextStyle](https://gloss-format.org/reference/free-text-style/) |  | `defaultstyle` | The text style. Absent: each style field's own default applies. |
| `fringe` | [Fringe](https://gloss-format.org/reference/fringe/) |  | `fringe` | The insets from rect to the text box. Absent means the box is rect. |
| `callout` | [Point](https://gloss-format.org/reference/point/)[]; 2 to 3 items |  | `callout` | A callout's leader line: the tip, an optional bend, and the point where it meets the box (PDF /CL). Absent means no leader line. |
| `head` | [LineEnding](https://gloss-format.org/reference/line-ending/) |  | `head` | The line ending at a callout's tip. Absent means None. |

## Example

```json
{
  "type": "freetext",
  "id": "a1",
  "page": 0,
  "author": "Ana",
  "createdAt": "2026-10-19T12:00:00Z",
  "rect": {
    "x": 72,
    "y": 600,
    "width": 220,
    "height": 40
  },
  "contents": "Check this clause",
  "defaultStyle": {
    "fontSize": 14,
    "color": "#1A1A1A"
  }
}
```

## Used by

- [Annotation](https://gloss-format.org/reference/annotation/)
