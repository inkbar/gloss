import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { field } from './registry'

describe('field', () => {
  it('refuses a schema that is already a field', () => {
    expect(() =>
      field(field(z.number(), { description: 'a' }), { description: 'b' })
    ).toThrow(/already a field/)
  })
})
