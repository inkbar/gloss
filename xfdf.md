# Gloss and XFDF

> How XFDF maps to JSON in Gloss: the Gloss type for every XFDF annotation element and the Gloss field for every XFDF attribute, with how each value is written.

XFDF is the XML format for PDF annotations, standardised as ISO 19444-1. Gloss carries the same annotations as JSON. This page lists the Gloss type for each XFDF element and the Gloss field for each XFDF attribute, generated from the names the schema records, so it matches `v1.json`.

## Elements

| XFDF element | Gloss type |
| --- | --- |
| `<highlight>` | [`highlight`](https://gloss-format.org/reference/highlight/) |
| `<underline>` | [`underline`](https://gloss-format.org/reference/underline/) |
| `<strikeout>` | [`strikeout`](https://gloss-format.org/reference/strikeout/) |
| `<squiggly>` | [`squiggly`](https://gloss-format.org/reference/squiggly/) |
| `<text>` | [`text`](https://gloss-format.org/reference/note/) |
| `<freetext>` | [`freetext`](https://gloss-format.org/reference/free-text/) |
| `<square>` | [`square`](https://gloss-format.org/reference/square/) |
| `<circle>` | [`circle`](https://gloss-format.org/reference/circle/) |
| `<line>` | [`line`](https://gloss-format.org/reference/line/) |
| `<polyline>` | [`polyline`](https://gloss-format.org/reference/polyline/) |
| `<polygon>` | [`polygon`](https://gloss-format.org/reference/polygon/) |
| `<ink>` | [`ink`](https://gloss-format.org/reference/ink/) |
| `<stamp>` | [`stamp`](https://gloss-format.org/reference/stamp/) |
| `<redact>` | [`redact`](https://gloss-format.org/reference/redact/) |

## Attributes on every annotation

Every element takes these. The element name gives the Gloss `type`.

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `name` | [`id`](https://gloss-format.org/reference/common/) |  |
| `page` | [`page`](https://gloss-format.org/reference/common/) |  |
| `rect` | [`rect`](https://gloss-format.org/reference/common/) | XFDF writes it as x1,y1,x2,y2. |
| `color` | [`color`](https://gloss-format.org/reference/common/) |  |
| `opacity` | [`opacity`](https://gloss-format.org/reference/common/) |  |
| `title` | [`author`](https://gloss-format.org/reference/common/) |  |
| `contents` | [`contents`](https://gloss-format.org/reference/common/) |  |
| `inreplyto` | [`inReplyTo`](https://gloss-format.org/reference/common/) |  |
| `creationdate` | [`createdAt`](https://gloss-format.org/reference/common/) | XFDF writes a PDF date string (D:20261019120000Z). |
| `date` | [`modifiedAt`](https://gloss-format.org/reference/common/) | XFDF writes a PDF date string. |
| `subject` | [`subject`](https://gloss-format.org/reference/common/) |  |
| `intent` | [`intent`](https://gloss-format.org/reference/common/) | What a mark is for, such as a callout or an arrow (XFDF intent, PDF /IT). |
| none, an extension | [`custom`](https://gloss-format.org/reference/common/) |  |

## `<highlight>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `coords` | [`quads`](https://gloss-format.org/reference/highlight/) |  |

## `<underline>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `coords` | [`quads`](https://gloss-format.org/reference/underline/) |  |

## `<strikeout>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `coords` | [`quads`](https://gloss-format.org/reference/strikeout/) |  |

## `<squiggly>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `coords` | [`quads`](https://gloss-format.org/reference/squiggly/) |  |

## `<text>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `icon` | [`icon`](https://gloss-format.org/reference/note/) | The icon a note shows on the page (XFDF icon, PDF /Name). |

## `<freetext>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `width` | [`width`](https://gloss-format.org/reference/free-text/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/free-text/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| none | [`cornerRadius`](https://gloss-format.org/reference/free-text/) | XFDF has no attribute for it. |
| `defaultstyle` | [`defaultStyle`](https://gloss-format.org/reference/free-text/) | The keys are the CSS property names XFDF writes in its defaultstyle string, in camel case. |
| `fringe` | [`fringe`](https://gloss-format.org/reference/free-text/) | Insets from an annotation's rect to the area it draws in, in points (PDF /RD, XFDF fringe, both in this order). |
| `callout` | [`callout`](https://gloss-format.org/reference/free-text/) |  |
| `head` | [`head`](https://gloss-format.org/reference/free-text/) | The shape drawn at the end of a line (XFDF head and tail, PDF /LE). |

## `<square>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `width` | [`width`](https://gloss-format.org/reference/square/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/square/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| `interior-color` | [`interiorColor`](https://gloss-format.org/reference/square/) |  |
| none | [`cornerRadius`](https://gloss-format.org/reference/square/) | XFDF has no attribute for it. |

## `<circle>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `width` | [`width`](https://gloss-format.org/reference/circle/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/circle/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| `interior-color` | [`interiorColor`](https://gloss-format.org/reference/circle/) |  |

## `<line>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `start` | [`start`](https://gloss-format.org/reference/line/) |  |
| `end` | [`end`](https://gloss-format.org/reference/line/) |  |
| `width` | [`width`](https://gloss-format.org/reference/line/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/line/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| `head` | [`head`](https://gloss-format.org/reference/line/) | The shape drawn at the end of a line (XFDF head and tail, PDF /LE). |
| `tail` | [`tail`](https://gloss-format.org/reference/line/) | The shape drawn at the end of a line (XFDF head and tail, PDF /LE). |

## `<polyline>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `vertices` | [`vertices`](https://gloss-format.org/reference/polyline/) |  |
| `width` | [`width`](https://gloss-format.org/reference/polyline/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/polyline/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| `interior-color` | [`interiorColor`](https://gloss-format.org/reference/polyline/) |  |
| `head` | [`head`](https://gloss-format.org/reference/polyline/) | The shape drawn at the end of a line (XFDF head and tail, PDF /LE). |
| `tail` | [`tail`](https://gloss-format.org/reference/polyline/) | The shape drawn at the end of a line (XFDF head and tail, PDF /LE). |

## `<polygon>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `vertices` | [`vertices`](https://gloss-format.org/reference/polygon/) |  |
| `width` | [`width`](https://gloss-format.org/reference/polygon/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/polygon/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |
| `interior-color` | [`interiorColor`](https://gloss-format.org/reference/polygon/) |  |

## `<ink>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `inklist` | [`inklist`](https://gloss-format.org/reference/ink/) |  |
| `width` | [`width`](https://gloss-format.org/reference/ink/) |  |
| `dashes` | [`dashes`](https://gloss-format.org/reference/ink/) | A dash pattern in points: lengths on, then off, repeating (XFDF dashes, PDF /D). |

## `<stamp>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `imagedata` | [`imagedata`](https://gloss-format.org/reference/stamp/) |  |
| `rotation` | [`rotation`](https://gloss-format.org/reference/stamp/) |  |

## `<redact>`

| XFDF | Gloss | Notes |
| --- | --- | --- |
| `coords` | [`quads`](https://gloss-format.org/reference/redact/) |  |
| `interior-color` | [`interiorColor`](https://gloss-format.org/reference/redact/) |  |
| `overlay-text` | [`overlayText`](https://gloss-format.org/reference/redact/) |  |
