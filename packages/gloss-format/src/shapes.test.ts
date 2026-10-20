import { describe, expect, it } from 'vitest'

import { Color, Common, LineEnding, Rect } from './shapes'

describe('shapes', () => {
  it('keeps unknown keys on an object', () => {
    expect(Rect.parse({ x: 0, y: 0, width: 1, height: 1, extra: true })).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      extra: true,
    })
  })

  it('rejects a colour that is not #RRGGBB', () => {
    expect(Color.safeParse('yellow').success).toBe(false)
    expect(Color.safeParse('#ffcc00').success).toBe(true)
  })

  it('accepts known and unknown PDF names but not invalid ones', () => {
    expect(LineEnding.safeParse('OpenArrow').success).toBe(true)
    expect(LineEnding.safeParse('Squiggle').success).toBe(true)
    expect(LineEnding.safeParse('Open Arrow').success).toBe(false)
  })

  it('requires type, id, page and rect on Common, and nothing else', () => {
    const minimal = {
      type: 'highlight',
      id: 'a1',
      page: 0,
      rect: { x: 0, y: 0, width: 10, height: 10 },
    }
    expect(Common.safeParse(minimal).success).toBe(true)
    for (const key of Object.keys(minimal)) {
      const rest: Record<string, unknown> = { ...minimal }
      delete rest[key]
      expect(Common.safeParse(rest).success, `without ${key}`).toBe(false)
    }
  })
})
