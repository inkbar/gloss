import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { publishSchema } from './schema-file.ts'

const schemaPath = createRequire(import.meta.url).resolve('gloss-format/schema.json')

describe('publishSchema', () => {
  let dir: string | undefined

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
    dir = undefined
  })

  it('writes the package schema to schema/v1.json byte for byte', () => {
    dir = mkdtempSync(join(tmpdir(), 'gloss-site-'))
    publishSchema(pathToFileURL(`${dir}/`))

    const written = readFileSync(join(dir, 'schema', 'v1.json'))
    expect(written.equals(readFileSync(schemaPath))).toBe(true)
  })
})
