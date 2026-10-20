import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

/**
 * Copies the package's JSON Schema into the site's public directory as schema/v1.json, so the
 * schema's `$id` (https://gloss-format.org/schema/v1.json) serves the published file unchanged.
 */
export function publishSchema(publicDir: URL): void {
  const source = createRequire(import.meta.url).resolve('gloss-format/schema.json')
  const target = new URL('schema/', publicDir)
  mkdirSync(target, { recursive: true })
  copyFileSync(source, new URL('v1.json', target))
}
