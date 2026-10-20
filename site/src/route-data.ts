// Adds each page's social card, and keeps pull request previews out of search results.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

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
      { tag: 'meta', attrs: { name: 'twitter:image', content: image } }
    )
  }
  // A preview copies the site under /pr-preview/pr-<number>/ on the same domain.
  if (base !== '/')
    route.head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } })
})
