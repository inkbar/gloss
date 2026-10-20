# Document

> A Gloss document: the annotations on one PDF. Reference for Document in Gloss, a JSON format for PDF annotations.

A Gloss document: the annotations on one PDF.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Document"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `format` (required) | string; always `"gloss"` |  | — | Marks the file as Gloss. Always gloss. |
| `version` (required) | number; always `1` |  | — | The Gloss format version the document follows. Always 1 for this schema. |
| `documentKey` | string |  | — | Optional. Identifies the PDF the annotations belong to, in whatever form the writer and reader agree on. |
| `annotations` (required) | ([Annotation](https://gloss-format.org/reference/annotation/) or [UnknownAnnotation](https://gloss-format.org/reference/unknown-annotation/))[] |  | — | The annotations, in drawing order. Each is a type Gloss defines or one it doesn't. |

## Example

```json
{
  "format": "gloss",
  "version": 1,
  "annotations": [
    {
      "type": "highlight",
      "id": "a1",
      "page": 0,
      "rect": {
        "x": 72,
        "y": 700,
        "width": 120,
        "height": 14
      },
      "quads": [
        {
          "p1": {
            "x": 72,
            "y": 714
          },
          "p2": {
            "x": 192,
            "y": 714
          },
          "p3": {
            "x": 72,
            "y": 700
          },
          "p4": {
            "x": 192,
            "y": 700
          }
        }
      ]
    }
  ]
}
```
