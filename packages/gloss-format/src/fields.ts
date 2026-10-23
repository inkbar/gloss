import { z } from 'zod'

import { define, field } from './registry'

export const SignatureFieldValue = define(
  'SignatureFieldValue',
  z.looseObject({
    signature: field(z.string().min(1), {
      description:
        "The id of a stamp or ink annotation in the same document whose subject is Signature. That annotation is the signature's appearance.",
    }),
  }),
  {
    title: 'SignatureFieldValue',
    description:
      'The value of a signature field. It names a stamp or ink annotation with subject Signature in the same document, rather than holding the signature itself.',
    examples: [{ signature: 'a7' }],
  }
)
export type SignatureFieldValue = z.infer<typeof SignatureFieldValue>

export const FieldValue = define(
  'FieldValue',
  z.union([z.string(), z.array(z.string()), SignatureFieldValue]),
  {
    title: 'FieldValue',
    description:
      'The value of one form field. A string fills a text, checkbox, radio, combo or single-select list field. Checkbox and radio values are appearance-state names, and "Off" is the unchecked state. An array of strings fills a multi-select list field, in option order. An object names a signature annotation. An empty string means the field is empty.',
    examples: ['Ada', 'Off', ['maths', 'engines'], { signature: 'a7' }],
  }
)
export type FieldValue = z.infer<typeof FieldValue>

export const Fields = define('Fields', z.record(z.string().min(1), FieldValue), {
  title: 'Fields',
  description:
    'Form field values, keyed by full dotted field name, such as applicant.name. A key that is absent means the document does not state that field. An empty string means the field is empty.',
  'x-xfdf': 'fields/field',
  examples: [
    {
      'applicant.name': 'Ada',
      'applicant.newsletter': 'Yes',
      interests: ['maths', 'engines'],
      'applicant.signature': { signature: 'a7' },
    },
  ],
})
export type Fields = z.infer<typeof Fields>
