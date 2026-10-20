import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { generateReference } from './generate.ts'

import type { JsonSchema } from './render.ts'

const schema = createRequire(import.meta.url)('gloss-format/schema.json') as JsonSchema

describe('generateReference', () => {
  let dir: string | undefined

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
    dir = undefined
  })

  it('writes a page per definition into an emptied folder and returns the groups in order', () => {
    dir = mkdtempSync(join(tmpdir(), 'gloss-reference-'))
    writeFileSync(join(dir, 'stale.md'), 'old')

    const groups = generateReference(schema, pathToFileURL(`${dir}/`))

    const defs = Object.keys(schema['$defs'] as object)
    expect(readdirSync(dir)).toHaveLength(defs.length)
    expect(groups.map((g) => g.label)).toEqual([
      'Document',
      'Annotation types',
      'Shared shapes',
      'Enums',
    ])
    expect(
      groups
        .at(-1)
        ?.items.map((i) => i.label)
        .sort()
    ).toEqual(['Intent', 'LineEnding', 'NoteIcon'])
    expect(groups[1]?.items[0]).toEqual({
      label: 'Highlight',
      slug: 'reference/highlight',
    })
  })

  it('needs the schema to have an $id', () => {
    dir = mkdtempSync(join(tmpdir(), 'gloss-reference-'))
    const { $id: _id, ...noId } = schema
    expect(() => generateReference(noId, pathToFileURL(`${dir}/`))).toThrow('$id')
  })
})
