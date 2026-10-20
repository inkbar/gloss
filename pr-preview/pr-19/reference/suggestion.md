# Suggestion

> Why a redaction was suggested: what a detector found and how sure it is. Reference for Suggestion in Gloss, a JSON format for PDF annotations.

Why a redaction was suggested: what a detector found and how sure it is. An extension; XFDF has no equivalent.

## Use it

```json
{
  "$ref": "https://gloss-format.org/schema/v1.json#/$defs/Suggestion"
}
```

## Fields

A field marked (required) must be present.

| Field | Type | Default | XFDF | Description |
| --- | --- | --- | --- | --- |
| `confidence` (required) | number; 0 to 1 |  | — | How sure the detector is, from 0 to 1. |
| `jobId` | string |  | — | The detection run that made the suggestion. Absent means unknown. |
| `reason` | string |  | — | A short label for what was found, such as a name or an account number. Absent means none. |
| `explanation` | string |  | — | Why the text was suggested, for the reviewer. Absent means none. |
| `recommendation` | string; one of `"redact"`, `"review"`, `"keep"` |  | — | What the detector recommends doing with the mark. Absent means no recommendation. |

## Example

```json
{
  "confidence": 0.92,
  "reason": "Person name",
  "recommendation": "redact"
}
```

## Used by

- [Redact](https://gloss-format.org/reference/redact/)
