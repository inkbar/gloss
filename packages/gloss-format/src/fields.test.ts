import { describe, expect, it } from 'vitest'

import { Fields, FieldValue, SignatureFieldValue } from './fields'

describe('Fields', () => {
  it('accepts text, choice, multi-select and signature values', () => {
    const fields = {
      'applicant.name': 'Ada',
      'applicant.newsletter': 'Yes',
      interests: ['maths', 'engines'],
      'applicant.signature': { signature: 'a7' },
    }
    expect(Fields.safeParse(fields).success).toBe(true)
  })

  it('accepts an empty string and an empty list', () => {
    expect(Fields.safeParse({ a: '', b: [] }).success).toBe(true)
  })

  it('rejects an empty field name', () => {
    expect(Fields.safeParse({ '': 'x' }).success).toBe(false)
  })

  it('rejects numbers and booleans', () => {
    expect(Fields.safeParse({ a: 1 }).success).toBe(false)
    expect(Fields.safeParse({ a: true }).success).toBe(false)
  })

  it('keeps unknown keys on a signature value, and rejects an empty or missing id', () => {
    const kept = SignatureFieldValue.parse({ signature: 'a7', extra: 1 })
    expect(kept).toEqual({ signature: 'a7', extra: 1 })
    expect(SignatureFieldValue.safeParse({ signature: '' }).success).toBe(false)
    expect(SignatureFieldValue.safeParse({}).success).toBe(false)
    expect(FieldValue.safeParse({ signature: '' }).success).toBe(false)
  })
})
