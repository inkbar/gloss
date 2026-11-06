# An open JSON format for PDF annotations

> Gloss is an open JSON format for PDF annotations, covering highlights, notes, shapes and redactions, with a JSON Schema and TypeScript types for every field.

Gloss is an open, viewer-neutral JSON format for PDF annotations. A Gloss document lists the highlights, notes, shapes and redactions on one PDF, each with its page and position. Gloss is for systems that pass annotations between them, where one writes the file and another reads it back.

## Gloss and XFDF

XFDF is the XML format for PDF annotations, standardised as [ISO 19444-1](https://www.pdfa.org/resource/iso-19444-xfdf/). Gloss has the same annotation types and uses the same coordinates. Where XFDF has a name for something, Gloss uses it: a sticky note is `text`, as in XFDF. A few fields read better in JSON under another name, such as `author` for XFDF's `title`. The reference gives the XFDF name of every field that has one, and [Gloss and XFDF](https://gloss-format.org/xfdf/) maps them all on one page.

Gloss also adds `custom`, for data of your own.

## How Gloss compares

Gloss carries the same annotations as XFDF, in JSON, with a JSON Schema at a stable URL. A PDF SDK's own JSON format also uses JSON, but it belongs to that SDK and changes with it. Gloss belongs to no viewer, so a document moves between systems unchanged.

|                                           | Gloss                             | XFDF        | A PDF SDK's own JSON    |
| ----------------------------------------- | --------------------------------- | ----------- | ----------------------- |
| Encoding                                  | JSON                              | XML         | JSON                    |
| Defined by                                | An open JSON Schema, MIT licensed | ISO 19444-1 | The SDK's documentation |
| Tied to one viewer                        | No                                | No          | Yes                     |
| Usable in your own JSON Schema or OpenAPI | Yes, by `$ref` to a URL           | No          | Depends on the SDK      |

## Media type and extension

Send Gloss as `application/vnd.gloss.annotations+json`. Save it with the `.gloss.json` extension.

The version is in the document, so the media type takes no parameter.

## A document

minimal.gloss.json:

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
          "p1": { "x": 72, "y": 714 },
          "p2": { "x": 192, "y": 714 },
          "p3": { "x": 72, "y": 700 },
          "p4": { "x": 192, "y": 700 }
        }
      ]
    }
  ]
}
```

Every annotation has a `type`, an `id` and a `page`, plus the geometry its type needs. A highlight needs a `rect` and the `quads` over the text. The [Document](https://gloss-format.org/reference/document/) page lists the rest.

## Coordinates

Every coordinate is in PDF user space, as [ISO 32000-2](https://www.iso.org/standard/75839.html) defines it: points, origin bottom-left, before the page's `/Rotate`. These are the numbers in the PDF file and in XFDF, so a mark keeps its values at any zoom or rotation.

A page's crop box can start away from `0 0`, so treat coordinates as raw user space and don't measure them from the corner of the page.

A [`rect`](https://gloss-format.org/reference/rect/) is `{ x, y, width, height }`, where `x` and `y` are the bottom-left corner. A [quad](https://gloss-format.org/reference/quad/) is `{ p1, p2, p3, p4 }`, in the corner order PDF uses for `/QuadPoints`: top-left, top-right, bottom-left, bottom-right.

## Versioning

The format version is the integer in the document and in the schema URL. A `version: 1` document validates against `v1.json`.

- **`v1.json` changes, but never breaks.** It gains fields, types and enum values over time. If you need a fixed copy, pin a version of the `gloss-format` package.
- **Changes only add.** A change that would reject a document `v1.json` used to accept goes into `v2.json`, published beside `v1.json`. The package version is a separate number from the format version.
- **Unknown fields are allowed.** No definition rejects a field it doesn't list, so a document from a newer writer still validates against an older schema. Readers may ignore unknown fields or pass them through. The schema won't flag a misspelled field name.
- **Unknown types are allowed.** An item with a string `type`, a string `id` and a page number is an annotation, even if Gloss doesn't know its type. Readers may ignore it or pass it through. An item whose type Gloss does know must match that type's definition, and a later version may define a type that is unknown today. Types are case-sensitive: `Highlight` is an unknown type, not a highlight.
- **Fields are optional by default.** Gloss requires only what makes an item an annotation: `type`, `id`, `page`, and the geometry its type can't be placed without. Where a field has a default, the schema records it and the reference shows it.

A document with one bad item fails as a whole. To keep the good items, validate each one against [`Annotation`](https://gloss-format.org/reference/annotation/) or [`UnknownAnnotation`](https://gloss-format.org/reference/unknown-annotation/) on its own.

If your system needs a field Gloss leaves optional, require it in your own schema. [Using Gloss in your schemas](https://gloss-format.org/using-gloss/) shows how.

## Your own data

Every annotation accepts `custom`, an object for data of your own, such as a case number or a review note. Gloss readers keep it as it is and never interpret it.

Three rules decide where a piece of data goes.

1. **Gloss holds what a PDF annotation dictionary can store, with the same meaning.**
2. **Everything else goes in `custom`, under your own key.** Use your product's name, so your data and another system's stay apart:

   ```json
   {
     "type": "square",
     "id": "a1",
     "page": 0,
     "rect": { "x": 72, "y": 700, "width": 120, "height": 14 },
     "custom": { "acme": { "caseNumber": "C-104" } }
   }
   ```

3. **A kind of annotation Gloss lacks is written as the nearest Gloss type.** Name the kind in your `custom` key. Any reader still draws the plain shape in the right place, and you read your own kind back:

   ```json
   {
     "type": "circle",
     "id": "a2",
     "page": 0,
     "rect": { "x": 72, "y": 650, "width": 40, "height": 40 },
     "custom": { "acme": { "type": "magnifier" } }
   }
   ```

Readers keep types they don't know so that a file from a newer version of Gloss survives; that is not a place for types of your own.

## Get the schema

The schema is JSON Schema 2020-12, published at [https://gloss-format.org/schema/v1.json](https://gloss-format.org/schema/v1.json).

The `gloss-format` package ships the same file as `gloss-format/schema.json`, with a zod schema and a TypeScript type for every definition:

```sh
npm install gloss-format
```

The package is [on npm](https://www.npmjs.com/package/gloss-format). The source of the package, the schema and this site is [on GitHub](https://github.com/inkbar/gloss).

Every definition has a page in the reference, starting with [Document](https://gloss-format.org/reference/document/).

## Questions

### What is Gloss?

Gloss is an open JSON format for PDF annotations. A Gloss document lists the highlights, notes, shapes and redactions on one PDF, with the page and position of each mark in PDF points. The format is a JSON Schema at `https://gloss-format.org/schema/v1.json`, and the `gloss-format` npm package ships it with TypeScript types.

### Is Gloss tied to one PDF viewer?

No. Gloss describes annotations, not a viewer's state, so any program can read and write it. A document from one system loads in another, and a reader keeps the fields and types it doesn't know, so data from a newer writer survives a round trip through an older one.

### How does Gloss relate to XFDF?

Gloss carries the same annotations as XFDF, the XML format standardised as ISO 19444-1, in JSON. It uses the same annotation types and coordinates, and where XFDF has a name for a field, Gloss uses it. [Gloss and XFDF](https://gloss-format.org/xfdf/) maps every XFDF element and attribute to its Gloss equivalent.

### Which annotation types does Gloss support?

Gloss defines `highlight`, `underline`, `strikeout`, `squiggly`, `text` (a note), `freetext`, `square`, `circle`, `line`, `polyline`, `polygon`, `ink`, `stamp` and `redact`, the annotation types XFDF defines. A reader keeps types it does not know, so a file from a newer version of Gloss still loads.

### Can I add my own data?

Yes. Every annotation accepts `custom`, an object Gloss readers keep as it is and never interpret. Put your data under a key of your own, such as `custom: { "acme": { "caseNumber": "C-104" } }`. For a kind of mark Gloss lacks, write the nearest Gloss type and record the kind in `custom.acme.type`, so other readers still draw the shape.

### How do I validate a Gloss document?

Load the schema from `https://gloss-format.org/schema/v1.json` into any JSON Schema 2020-12 validator, or install `gloss-format` from npm and call `GlossDocument.safeParse`. A document with one bad item fails as a whole, so validate each annotation on its own to keep the good ones.
