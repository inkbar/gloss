# Polygon

> Straight lines joining vertices in order, closed back to the first. The fields, defaults and XFDF names of the Polygon annotation in Gloss, a JSON format for PDF annotations.

Straight lines joining vertices in order, closed back to the first.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Polygon"
}
```

XFDF element: `polygon`

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `type` (required) | string; always `"polygon"` |  | — | The annotation type. Always polygon. |
| `id` (required) | string; at least 1 character |  | `name` | Unique within the document. Never reused for a different annotation. |
| `page` (required) | integer; ≥ 0 |  | `page` | The page the annotation is on, counted from 0. |
| `rect` (required) | [Rect](https://gloss-format.org/reference/rect/) |  | `rect` | The bounding box, in PDF user space. |
| `color` | [Color](https://gloss-format.org/reference/color/) |  | `color` | The annotation's colour. Absent: the reader chooses the colour. |
| `opacity` | number; 0 to 1 | `1` | `opacity` | Opacity, from 0 (invisible) to 1 (opaque). Absent means opaque. |
| `author` | string |  | `title` | Who made the annotation. Absent means unknown. |
| `contents` | string |  | `contents` | The annotation's text, such as a comment or a note. Absent means no text. |
| `inReplyTo` | string |  | `inreplyto` | The id of the annotation this one replies to. Replies form threads. Absent means the annotation is not a reply. |
| `createdAt` | string; format `date-time` (RFC 3339 with seconds and an offset, e.g. `2026-10-20T09:30:00Z`) |  | `creationdate` | When the annotation was made, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string (D:20261019120000Z). Absent means unknown. |
| `modifiedAt` | string; format `date-time` (RFC 3339 with seconds and an offset, e.g. `2026-10-20T09:30:00Z`) |  | `date` | When the annotation last changed, as an ISO 8601 date-time with an offset. XFDF writes a PDF date string. Absent means unknown. |
| `subject` | string |  | `subject` | A short label for what the mark is. Absent means no label. |
| `intent` | [Intent](https://gloss-format.org/reference/intent/) |  | `intent` | What the mark is for, such as a callout or an arrow. Absent means the type's plain form. |
| `custom` | object |  | — | Data of your own. Gloss readers keep it as it is and never interpret it. Absent means none. |
| `vertices` (required) | [Point](https://gloss-format.org/reference/point/)[]; at least 2 items |  | `vertices` | The points the lines join, in order. At least two. |
| `width` | number; ≥ 0 | `1` | `width` | The stroke width in points. Absent means 1. |
| `dashes` | [Dashes](https://gloss-format.org/reference/dashes/) |  | `dashes` | The dash pattern of the stroke. Absent means a solid line. |
| `interiorColor` | [Color](https://gloss-format.org/reference/color/) |  | `interior-color` | The fill inside the shape. Absent means no fill. |

## Example

```json
{
  "type": "polygon",
  "id": "a1",
  "page": 0,
  "author": "Ana",
  "createdAt": "2026-10-19T12:00:00Z",
  "rect": {
    "x": 72,
    "y": 200,
    "width": 200,
    "height": 60
  },
  "vertices": [
    {
      "x": 72,
      "y": 200
    },
    {
      "x": 172,
      "y": 260
    },
    {
      "x": 272,
      "y": 200
    }
  ],
  "interiorColor": "#FFE066"
}
```

## Used by

- [Annotation](https://gloss-format.org/reference/annotation/)
