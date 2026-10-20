// Every docs page as Markdown in one file, so a tool can read the whole site in one request.
import { markdownPages } from '../markdown/pages.ts'

import type { APIRoute } from 'astro'

export const GET: APIRoute = async () =>
  new Response((await markdownPages()).map((page) => page.markdown).join('\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
