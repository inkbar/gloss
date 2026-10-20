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
    // vitest sets BASE_URL in its own environment, and a child build would take it as the base.
    const { BASE_URL: _vitestBase, ...env } = process.env
    execFileSync('pnpm', ['exec', 'astro', 'build'], {
      cwd: site,
      env: { ...env, SITE_BASE: '/pr-preview/pr-1/' },
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

  it('resolves every relative link on the hand-written pages', () => {
    const broken: string[] = []
    for (const page of ['', 'using-gloss', 'xfdf']) {
      const dir = join(dist, page)
      const html = readFileSync(join(dir, 'index.html'), 'utf8')
      const hrefs = [...html.matchAll(/href="([^"#]*)/g)]
        .map(([, href]) => href)
        .filter((href) => href !== '' && !/^(?:[a-z]+:|\/)/.test(href))
      expect(hrefs.length, page).toBeGreaterThan(0)
      for (const href of hrefs) {
        const target = resolve(dir, href)
        const file = href.endsWith('/') ? join(target, 'index.html') : target
        if (!file.startsWith(dist) || !existsSync(file)) broken.push(`/${page}: ${href}`)
      }
    }
    expect(broken).toEqual([])
  })

  it('gives every page its own social card', () => {
    const missing: string[] = []
    for (const page of [
      '',
      'using-gloss',
      'xfdf',
      'reference/redact',
      'reference/rect',
    ]) {
      const html = readFileSync(join(dist, page, 'index.html'), 'utf8')
      const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]
      const expected = `https://gloss-format.org/pr-preview/pr-1/og/${page || 'index'}.png`
      if (image !== expected) missing.push(`/${page}: ${image}`)
      else if (!existsSync(join(dist, 'og', `${page || 'index'}.png`)))
        missing.push(`/${page}: no file`)
    }
    expect(missing).toEqual([])
  })

  it('keeps a preview out of search results', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf8')
    expect(html).toContain('<meta name="robots" content="noindex"')
  })

  it('publishes robots.txt and llms.txt', () => {
    expect(readFileSync(join(dist, 'robots.txt'), 'utf8')).toContain(
      'Sitemap: https://gloss-format.org/sitemap-index.xml'
    )
    expect(readFileSync(join(dist, 'llms.txt'), 'utf8')).toMatch(/^# Gloss\n/)
  })

  it('publishes the schema', () => {
    expect(existsSync(join(dist, 'schema', 'v1.json'))).toBe(true)
  })
})
