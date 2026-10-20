// Adds each page's social card, its Markdown copy and its structured data, and keeps pull
// request previews out of search results.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import { GLOSS_VERSION } from 'gloss-format'
import pkg from 'gloss-format/package.json' with { type: 'json' }

import { jsonLd } from './answers.ts'
import { CARD } from './og/size.ts'

const base = import.meta.env.BASE_URL

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  // The home page's entry id is empty, and its card is index.png.
  const id = route.entry.id || 'index'
  // The 404 page isn't in the docs collection, so it has no card.
  if (id !== '404') {
    const image = new URL(`${base}og/${id}.png`, context.site).href
    route.head.push(
      { tag: 'meta', attrs: { property: 'og:image', content: image } },
      { tag: 'meta', attrs: { property: 'og:image:width', content: String(CARD.width) } },
      {
        tag: 'meta',
        attrs: { property: 'og:image:height', content: String(CARD.height) },
      },
      { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
      {
        tag: 'link',
        attrs: { rel: 'alternate', type: 'text/markdown', href: `${base}${id}.md` },
      }
    )
  }
  // The home page describes the site and the package in its own frontmatter.
  if (id !== '404' && id !== 'index') {
    const { title, description } = route.entry.data
    route.head.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      content: jsonLd({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description,
        url: new URL(context.url.pathname, context.site).href,
        version: `Gloss format ${GLOSS_VERSION}, gloss-format ${pkg.version}`,
        isPartOf: { '@id': 'https://gloss-format.org/#website' },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://redactr.io/#organization',
          name: 'Redactr',
          url: 'https://redactr.io/',
        },
      }),
    })
  }
  // A preview copies the site under /pr-preview/pr-<number>/ on the same domain.
  if (base !== '/')
    route.head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } })
})
