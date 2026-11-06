# NoteIcon

> The icon a note shows on the page (XFDF icon, PDF /Name). Reference for NoteIcon in Gloss, a JSON format for PDF annotations.

The icon a note shows on the page (XFDF icon, PDF /Name). One of Comment, Note, Help, Insert, Key, NewParagraph, Paragraph. Any other PDF name is allowed and is kept unchanged.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/NoteIcon"
}
```

## Type

string; known values `"Comment"`, `"Note"`, `"Help"`, `"Insert"`, `"Key"`, `"NewParagraph"`, `"Paragraph"`; any other value matches `^[^\s()<>[\]{}/%]+$`

## Used by

- [Note](https://gloss-format.org/reference/note/)
