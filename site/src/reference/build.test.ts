import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'

const site = fileURLToPath(new URL('../../', import.meta.url))
const dist = join(site, 'dist')
const reference = join(dist, 'reference')

describe('the built site under a preview base', () => {
  beforeAll(() => {
    // The links validator runs as part of the build, so a broken absolute link fails here.
    execFileSync('pnpm', ['exec', 'astro', 'build'], {
      cwd: site,
      env: { ...process.env, SITE_BASE: '/pr-preview/pr-1/' },
      stdio: 'pipe',
    })
  }, 120_000)

  it('has a page per definition', () => {
    expect(existsSync(join(reference, 'redact', 'index.html'))).toBe(true)
  })

  it('resolves every relative link between reference pages', () => {
    const broken: string[] = []
    let checked = 0
    for (const slug of readdirSync(reference)) {
      const page = join(reference, slug, 'index.html')
      if (!existsSync(page)) continue
      for (const [, href] of readFileSync(page, 'utf8').matchAll(
        /href="(\.\.\/[^"#]*)/g
      )) {
        checked++
        const target = resolve(reference, slug, href)
        const file = href.endsWith('/') ? join(target, 'index.html') : target
        if (!file.startsWith(reference) || !existsSync(file))
          broken.push(`${slug}: ${href}`)
      }
    }
    expect(checked).toBeGreaterThan(0)
    expect(broken).toEqual([])
  })

  it('publishes the schema', () => {
    expect(existsSync(join(dist, 'schema', 'v1.json'))).toBe(true)
  })
})
