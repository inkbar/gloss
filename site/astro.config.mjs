import { writeFileSync } from 'node:fs'

import { satteri } from '@astrojs/markdown-satteri'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'

import schema from 'gloss-format/schema.json' with { type: 'json' }

import { baseLinks } from './src/markdown/base-links.ts'
import { generateReference } from './src/reference/generate.ts'
import { renderLlms } from './src/llms.ts'
import { renderXfdf } from './src/reference/xfdf.ts'
import { publishSchema } from './src/schema-file.ts'

// The schema's $id is https://gloss-format.org/schema/v1.json, so the package's file is served
// from there unchanged.
publishSchema(new URL('./public/', import.meta.url))

// One page per schema definition, written into a gitignored folder on every build and dev start.
const reference = generateReference(
  schema,
  new URL('./src/content/docs/reference/', import.meta.url)
)
// The XFDF mapping page and /llms.txt come from the schema too, and are gitignored the same way.
writeFileSync(new URL('./src/content/docs/xfdf.md', import.meta.url), renderXfdf(schema))
writeFileSync(
  new URL('./public/llms.txt', import.meta.url),
  renderLlms(schema, reference)
)

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
      customCss: [
        '@fontsource/ibm-plex-sans/400.css',
        '@fontsource/ibm-plex-sans/500.css',
        '@fontsource/ibm-plex-sans/600.css',
        '@fontsource/ibm-plex-mono/400.css',
        '@fontsource/ibm-plex-mono/500.css',
        '@fontsource/ibm-plex-serif/400-italic.css',
        './src/styles/gloss.css',
      ],
      // One light theme, with code on the page grey and square corners.
      expressiveCode: {
        themes: ['github-light'],
        styleOverrides: {
          borderRadius: '0',
          borderColor: 'var(--sl-color-gray-5)',
          codeBackground: 'var(--sl-color-gray-7)',
          codeFontFamily: 'var(--sl-font-mono)',
          uiFontFamily: 'var(--sl-font)',
          frames: {
            editorTabBarBackground: 'var(--sl-color-black)',
            editorActiveTabBackground: 'var(--sl-color-gray-7)',
            editorActiveTabIndicatorTopColor: 'var(--sl-color-accent)',
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      // Each page's social card, and noindex on previews.
      routeMiddleware: './src/route-data.ts',
      components: {
        Footer: './src/components/Footer.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        // Light only: no theme picker, and the page is pinned to the light theme.
        ThemeSelect: './src/components/ThemeSelect.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
      },
      editLink: { baseUrl: 'https://github.com/inkbar/gloss/edit/main/site/' },
      // The reference pages link to each other relatively, so they work under any base. The
      // validator can't follow relative links; the build test checks them instead.
      plugins: [starlightLinksValidator({ errorOnRelativeLinks: false })],
      sidebar: [
        { label: 'Introduction', slug: 'index' },
        { label: 'Using Gloss in your schemas', slug: 'using-gloss' },
        { label: 'Gloss and XFDF', slug: 'xfdf' },
        {
          label: 'Reference',
          items: reference.map((g) => ({ label: g.label, items: g.items })),
        },
      ],
    }),
  ],
})
