// Each docs page as Markdown at /<page>.md, for tools that read docs. The route middleware
// links each page to its copy.
import { markdownPages } from '../markdown/pages.ts'

import type { APIRoute, GetStaticPaths } from 'astro'

export const getStaticPaths = (async () =>
  (await markdownPages()).map(({ id, markdown }) => ({
    params: { slug: id },
    props: { markdown },
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown as string, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
