# Polyline

> Straight lines joining vertices in order, left open. The fields, defaults and XFDF names of the Polyline annotation in Gloss, a JSON format for PDF annotations.

Straight lines joining vertices in order, left open.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Polyline"
}
```

XFDF element: `polyline`

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `type` (required) | string; always `"polyline"` |  | — | The annotation type. Always polyline. |
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
| `custom` | object |  | — | Data of your own, under a key of your own, such as your product's name: { "acme": { ... } }. Gloss readers keep it as it is and never interpret it. Absent means none. |
| `vertices` (required) | [Point](https://gloss-format.org/reference/point/)[]; at least 2 items |  | `vertices` | The points the lines join, in order. At least two. |
| `width` | number; ≥ 0 | `1` | `width` | The stroke width in points. Absent means 1. |
| `dashes` | [Dashes](https://gloss-format.org/reference/dashes/) |  | `dashes` | The dash pattern of the stroke. Absent means a solid line. |
| `interiorColor` | [Color](https://gloss-format.org/reference/color/) |  | `interior-color` | The fill inside the shape. Absent means no fill. |
| `head` | [LineEnding](https://gloss-format.org/reference/line-ending/) |  | `head` | The line ending at the first vertex. Absent means None. |
| `tail` | [LineEnding](https://gloss-format.org/reference/line-ending/) |  | `tail` | The line ending at the last vertex. Absent means None. |

## Example

```json
{
  "type": "polyline",
  "id": "a1",
  "page": 0,
  "author": "Ana",
  "createdAt": "2026-10-19T12:00:00Z",
  "rect": {
    "x": 72,
    "y": 300,
    "width": 200,
    "height": 60
  },
  "vertices": [
    {
      "x": 72,
      "y": 300
    },
    {
      "x": 172,
      "y": 360
    },
    {
      "x": 272,
      "y": 300
    }
  ],
  "width": 2
}
```

## Used by

- [Annotation](https://gloss-format.org/reference/annotation/)
