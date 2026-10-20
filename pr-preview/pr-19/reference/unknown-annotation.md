# UnknownAnnotation

> An annotation of a type this version of Gloss does not define, such as one from a newer writer or a host's own. Reference for UnknownAnnotation in Gloss, a JSON format for PDF annotations.

An annotation of a type this version of Gloss does not define, such as one from a newer writer or a host's own. It needs a type, an id and a page. Readers may ignore it or pass it through. Types match case-sensitively, so Highlight is an unknown type. Gloss never defines a type that starts with x-, so a host's own types should use that prefix: no later version can then reject them.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/UnknownAnnotation"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `type` (required) | any string except a type Gloss defines (see [Annotation](https://gloss-format.org/reference/annotation/)) |  | — | An annotation type this version of Gloss doesn't define. A type Gloss defines must match its own definition instead. |
| `id` (required) | string; at least 1 character |  | `name` | Unique within the document. Never reused for a different annotation. |
| `page` (required) | integer; ≥ 0 |  | `page` | The page the annotation is on, counted from 0. |

## Example

```json
{
  "type": "sticker",
  "id": "a1",
  "page": 0,
  "sticker": "star"
}
```

## Used by

- [Document](https://gloss-format.org/reference/document/)
