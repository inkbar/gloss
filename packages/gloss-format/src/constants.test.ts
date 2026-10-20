import { describe, expect, it } from 'vitest'

import {
  GLOSS_FORMAT,
  GLOSS_MEDIA_TYPE,
  GLOSS_SCHEMA_ID,
  GLOSS_VERSION,
} from './constants'

describe('constants', () => {
  it('pins the format identifiers', () => {
    expect(GLOSS_FORMAT).toBe('gloss')
    expect(GLOSS_VERSION).toBe(1)
    expect(GLOSS_MEDIA_TYPE).toBe('application/vnd.gloss.annotations+json')
    expect(GLOSS_SCHEMA_ID).toBe('https://gloss-format.org/schema/v1.json')
  })
})
