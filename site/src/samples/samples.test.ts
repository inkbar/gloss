import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { Ajv2020 } from 'ajv/dist/2020.js'
import { GlossDocument } from 'gloss-format'
import glossSchema from 'gloss-format/schema.json' with { type: 'json' }
import { afterEach, describe, expect, it, vi } from 'vitest'

// The pages show these files as they are, so checking the files checks the pages.
const site = fileURLToPath(new URL('../../', import.meta.url))
const sample = (name: string) => fileURLToPath(new URL(`./${name}`, import.meta.url))
const json = (name: string): unknown => JSON.parse(readFileSync(sample(name), 'utf8'))

const GLOSS = 'https://gloss-format.org/schema/v1.json'

// Set up as the guide says: Ajv's default strict mode, formats off, x-xfdf declared.
function gloss() {
  const ajv = new Ajv2020({ validateFormats: false })
  ajv.addKeyword('x-xfdf')
  ajv.addSchema(glossSchema)
  return ajv
}

const quad = {
  p1: { x: 72, y: 714 },
  p2: { x: 192, y: 714 },
  p3: { x: 72, y: 700 },
  p4: { x: 192, y: 700 },
}
const redaction = {
  type: 'redact',
  id: 'r1',
  page: 0,
  rect: { x: 72, y: 700, width: 120, height: 14 },
  quads: [quad],
}

describe('minimal.gloss.json', () => {
  it('is a valid Gloss document', () => {
    const doc = json('minimal.gloss.json')
    const validate = gloss().getSchema(GLOSS)!
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true)
    expect(GlossDocument.safeParse(doc).success).toBe(true)
  })
})

describe('audited-redaction.schema.json', () => {
  const validate = () => gloss().compile(json('audited-redaction.schema.json') as object)
  const createdAt = '2026-10-20T09:30:00Z'

  it('rejects a redaction without an author', () => {
    expect(validate()({ ...redaction, createdAt })).toBe(false)
  })

  it('rejects a redaction without a creation time', () => {
    expect(validate()({ ...redaction, author: 'Ed' })).toBe(false)
  })

  it('accepts a redaction with both', () => {
    const check = validate()
    expect(
      check({ ...redaction, author: 'Ed', createdAt }),
      JSON.stringify(check.errors)
    ).toBe(true)
  })

  it('still applies the Gloss definition', () => {
    const { rect: _rect, ...noRect } = redaction
    expect(validate()({ ...noRect, author: 'Ed', createdAt })).toBe(false)
  })
})

// The guide says how to close a Gloss object, and which keyword doesn't.
describe('closing a Gloss definition', () => {
  const redact = { $ref: `${GLOSS}#/$defs/Redact` }
  const extra = { ...redaction, colour: '#000000' }

  it('works with propertyNames', () => {
    const names = Object.keys(
      (glossSchema.$defs.Redact as { properties: object }).properties
    )
    const check = gloss().compile({ allOf: [redact], propertyNames: { enum: names } })
    expect(check(redaction)).toBe(true)
    expect(check(extra)).toBe(false)
  })

  it('does not work with unevaluatedProperties', () => {
    const check = gloss().compile({ allOf: [redact], unevaluatedProperties: false })
    expect(check(extra)).toBe(true)
  })
})

describe('openapi.json', () => {
  it('describes a list of redactions', () => {
    const api = json('openapi.json') as {
      openapi: string
      paths: Record<string, Record<string, unknown>>
    }
    expect(api.openapi).toMatch(/^3\.1\./)
    const get = api.paths['/documents/{id}/redactions']?.['get'] as {
      responses: { 200: { content: { 'application/json': { schema: object } } } }
    }
    const check = gloss().compile(get.responses[200].content['application/json'].schema)
    const list = [redaction, { ...redaction, id: 'r2' }]
    expect(check(list), JSON.stringify(check.errors)).toBe(true)
    expect(check([{ ...redaction, type: 'highlight' }])).toBe(false)
  })
})

describe('the TypeScript samples', () => {
  const files = ['validate-zod.ts', 'validate-ajv.ts']

  it('are part of the site typecheck', () => {
    const listed = execFileSync(
      'pnpm',
      ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json', '--listFilesOnly'],
      { cwd: site, encoding: 'utf8' }
    )
    for (const file of files) {
      expect(existsSync(sample(file)), file).toBe(true)
      expect(listed).toContain(`src/samples/${file}`)
    }
  })

  it('typecheck', () => {
    expect(() =>
      execFileSync('pnpm', ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], {
        cwd: site,
        stdio: 'pipe',
      })
    ).not.toThrow()
  }, 60_000)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Each sample logs what its comments say it prints.
  it.each([
    ['validate-zod.ts', [['highlight', 'a1', 'on page', 0], [1]]],
    ['validate-ajv.ts', [[true]]],
  ])('%s runs and prints what it says', async (file, printed) => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await import(/* @vite-ignore */ sample(file))
    expect(log.mock.calls).toEqual(printed)
  })
})
