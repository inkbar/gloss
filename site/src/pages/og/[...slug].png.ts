// One social card per docs page, at /og/<entry id>.png. The route middleware links each page
// to its card.
import { getCollection } from 'astro:content'

import { renderCard } from '../../og/card.ts'

import type { APIRoute, GetStaticPaths } from 'astro'

export const getStaticPaths = (async () => {
  const entries = await getCollection('docs')
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      // The description's first sentence: the card has room for one idea. The home page's title
      // already says what its description opens with.
      description:
        entry.id === 'index'
          ? 'Highlights, notes, shapes and redactions, with a JSON Schema and TypeScript types for every field.'
          : (/^.*?[.!?](?=\s|$)/s.exec(entry.data.description ?? '')?.[0] ?? ''),
      path: entry.id === 'index' ? '' : `${entry.id}/`,
      mono: entry.id.startsWith('reference/'),
    },
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as Parameters<typeof renderCard>[0])
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
