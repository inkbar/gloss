import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { format, resolveConfig } from 'prettier'

import { buildSchema } from '../src/schema'

const target = fileURLToPath(new URL('../schema.json', import.meta.url))
const options = await resolveConfig(target)
const json = await format(JSON.stringify(buildSchema()), {
  ...options,
  filepath: target,
})
writeFileSync(target, json)
console.log('wrote schema.json')
