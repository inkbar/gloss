import { satteri } from '@astrojs/markdown-satteri'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'

import { baseLinks } from './src/markdown/base-links.ts'
import { publishSchema } from './src/schema-file.ts'

// The schema's $id is https://gloss-format.org/schema/v1.json, so the package's file is served
// from there unchanged.
publishSchema(new URL('./public/', import.meta.url))

// Pull request previews are served from /pr-preview/pr-<number>/; the site itself from the root.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  site: 'https://gloss-format.org',
  base,
  // Pages runs Jekyll over the gh-pages branch, which drops directories that start with an
  // underscore, so the CSS and JS go in assets/ rather than Astro's default _astro/.
  build: { assets: 'assets' },
  markdown: { processor: satteri({ hastPlugins: [baseLinks(base)] }) },
  integrations: [
    starlight({
      title: 'Gloss',
      description: 'An open JSON format for PDF annotations.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/gloss.css'],
      components: {
        Footer: './src/components/Footer.astro',
        // Light only: no theme picker, and the page is pinned to the light theme.
        ThemeSelect: './src/components/ThemeSelect.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
      },
      editLink: { baseUrl: 'https://github.com/inkbar/gloss/edit/main/site/' },
      plugins: [starlightLinksValidator()],
      sidebar: [{ label: 'Introduction', slug: 'index' }],
    }),
  ],
})
