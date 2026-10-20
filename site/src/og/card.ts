/**
 * Draws a page's social card, 1200×630: the wordmark, the page title and its first sentence on
 * white, in the site's type. satori lays it out as SVG and resvg turns that into a PNG.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

import { CARD } from './size.ts'

const INK = '#16181d'
const MUTED = '#5b616e'
const RUBRIC = '#b8321a'
const PAD = 80
const TEXT_WIDTH = CARD.width - 2 * PAD

export interface Card {
  title: string
  description: string
  /** The page's path, shown at the foot of the card: `reference/redact/`. */
  path: string
  /** Set the title in mono, as the reference pages name a definition. */
  mono?: boolean
}

const require = createRequire(import.meta.url)
// satori reads WOFF but not WOFF2, so the cards use the .woff files fontsource ships beside them.
function font(pkg: string, file: string): Buffer {
  return readFileSync(join(dirname(require.resolve(`@fontsource/${pkg}`)), 'files', file))
}
const fonts = [
  {
    name: 'Plex Sans',
    weight: 400,
    data: font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'),
  },
  {
    name: 'Plex Sans',
    weight: 600,
    data: font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
  },
  {
    name: 'Plex Mono',
    weight: 500,
    data: font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
  },
] as const

type Node = { type: string; props: Record<string, unknown> }
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
})

function corner(at: 'top' | 'bottom'): Node {
  const edge = '6px solid ' + RUBRIC
  return el('div', {
    position: 'absolute',
    width: 32,
    height: 32,
    ...(at === 'top'
      ? { top: 0, left: 0, borderTop: edge, borderLeft: edge }
      : { bottom: 0, right: 0, borderBottom: edge, borderRight: edge }),
  })
}

export async function renderCard({
  title,
  description,
  path,
  mono = false,
}: Card): Promise<Buffer> {
  const wordmark = el(
    'div',
    { position: 'relative', display: 'flex', padding: '10px 26px 20px 22px' },
    [
      corner('top'),
      corner('bottom'),
      el(
        'div',
        {
          fontFamily: 'Plex Sans',
          fontWeight: 600,
          fontSize: 64,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        },
        'gloss'
      ),
    ]
  )
  const heading = el(
    'div',
    {
      width: TEXT_WIDTH,
      fontFamily: mono ? 'Plex Mono' : 'Plex Sans',
      fontWeight: mono ? 500 : 600,
      fontSize: mono ? 88 : 68,
      letterSpacing: mono ? '-0.02em' : '-0.03em',
      lineHeight: 1.1,
      color: INK,
    },
    title
  )
  const lead = el(
    'div',
    {
      fontFamily: 'Plex Sans',
      fontWeight: 400,
      fontSize: 32,
      lineHeight: 1.4,
      color: '#3d424c',
      lineClamp: 3,
    },
    description
  )
  const foot = el(
    'div',
    {
      display: 'flex',
      fontFamily: 'Plex Mono',
      fontWeight: 500,
      fontSize: 24,
      color: MUTED,
    },
    `gloss-format.org/${path}`
  )
  const root = el(
    'div',
    {
      width: CARD.width,
      height: CARD.height,
      // satori sizes boxes as content-box, so without this the padding grows the card.
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      padding: `64px ${PAD}px`,
      background: '#ffffff',
      color: INK,
    },
    [
      el('div', { display: 'flex' }, [wordmark]),
      el('div', { display: 'flex', flexGrow: 1 }),
      el('div', { display: 'flex', flexDirection: 'column', gap: 24 }, [heading, lead]),
      el('div', { display: 'flex', flexGrow: 1 }),
      foot,
    ]
  )

  const svg = await satori(root, {
    ...CARD,
    fonts: fonts.map((f) => ({ ...f, style: 'normal' as const })),
  })
  return new Resvg(svg, { fitTo: { mode: 'width', value: CARD.width } }).render().asPng()
}
