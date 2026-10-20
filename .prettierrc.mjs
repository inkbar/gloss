import base from '@ecssc/prettier-config'

// Adds Astro support to the house config. The Tailwind plugin has to stay last.
export default {
  ...base,
  plugins: ['prettier-plugin-astro', ...base.plugins],
  overrides: [
    ...(base.overrides ?? []),
    { files: '*.astro', options: { parser: 'astro' } },
  ],
}
