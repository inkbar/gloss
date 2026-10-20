/**
 * Copy that the site shows and also states as JSON-LD: the introduction's questions and the
 * guide's validation steps. Keeping one copy means the structured data always matches the page.
 * The text uses inline Markdown only: `code` and [links](relative/).
 */

export interface Answer {
  question: string
  answer: string
}

export const QUESTIONS: Answer[] = [
  {
    question: 'What is Gloss?',
    answer:
      'Gloss is an open JSON format for PDF annotations. A Gloss document lists the highlights, notes, shapes and redactions on one PDF, with the page and position of each mark in PDF points. The format is a JSON Schema at `https://gloss-format.org/schema/v1.json`, and the `gloss-format` npm package ships it with TypeScript types.',
  },
  {
    question: 'Is Gloss tied to one PDF viewer?',
    answer:
      "No. Gloss describes annotations, not a viewer's state, so any program can read and write it. A document from one system loads in another, and a reader keeps the fields and types it doesn't know, so data from a newer writer survives a round trip through an older one.",
  },
  {
    question: 'How does Gloss relate to XFDF?',
    answer:
      'Gloss carries the same annotations as XFDF, the XML format standardised as ISO 19444-1, in JSON. It uses the same annotation types and coordinates, and where XFDF has a name for a field, Gloss uses it. [Gloss and XFDF](xfdf/) maps every XFDF element and attribute to its Gloss equivalent.',
  },
  {
    question: 'Which annotation types does Gloss support?',
    answer:
      "Gloss defines `highlight`, `underline`, `strikeout`, `squiggly`, `text` (a note), `freetext`, `square`, `circle`, `line`, `polyline`, `polygon`, `ink`, `stamp` and `redact`, the annotation types XFDF defines. A viewer can add its own types, and a document can carry types Gloss doesn't define.",
  },
  {
    question: 'Can I add my own data?',
    answer:
      'Yes. Every annotation accepts `custom`, an object Gloss readers keep as it is and never interpret. For a mark of your own, use a type that starts with `x-`, such as `x-sticker`. Gloss will never define a type with that prefix, so no later version of the schema can reject it.',
  },
  {
    question: 'How do I validate a Gloss document?',
    answer:
      'Load the schema from `https://gloss-format.org/schema/v1.json` into any JSON Schema 2020-12 validator, or install `gloss-format` from npm and call `GlossDocument.safeParse`. A document with one bad item fails as a whole, so validate each annotation on its own to keep the good ones.',
  },
]

export const VALIDATION_STEPS: string[] = [
  'Install the package: `npm install gloss-format`.',
  'Import `GlossDocument` from `gloss-format` and call `GlossDocument.safeParse` on the parsed JSON.',
  'If `success` is false, `error.issues` lists each problem and where it is. If it is true, `data` holds the document with every default filled in.',
]

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Inline Markdown as HTML: code spans and links. */
export function inlineHtml(text: string): string {
  return escape(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

/** Inline Markdown as plain text, for structured data. */
export function plainText(text: string): string {
  return text.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

/** A JSON-LD script body, safe to put inside a <script> element. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
