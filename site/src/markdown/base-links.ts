import { defineHastPlugin, type HastPluginEntry } from 'satteri'

/**
 * Prefixes root-relative links in Markdown with the site's base. Astro leaves them as written,
 * so without this a docs link to /docs/quickstart/ breaks when the site is served from a
 * subdirectory, as pull request previews are.
 */
export function baseLinks(base: string): HastPluginEntry {
  const prefix = base.replace(/\/$/, '')
  return () =>
    defineHastPlugin({
      name: 'gloss-base-links',
      element: {
        filter: ['a'],
        visit(node, ctx) {
          const href = node.properties['href']
          if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//'))
            ctx.setProperty(node, 'href', prefix + href)
        },
      },
    })
}
