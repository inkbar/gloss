# Gloss

Gloss is a JSON format for PDF annotations. A Gloss document lists highlights, notes, shapes and redactions by page and position, so one tool can write annotations and another can read them back.

The format is described at [gloss-format.org](https://gloss-format.org). The [`gloss-format`](packages/gloss-format) package holds the JSON Schema and the TypeScript types.

## Releasing

`gloss-format` is released through the release PR that release-please keeps open on `main`. Merging it tags the commit and publishes a GitHub release. Publishing the release puts the package on npm and deploys the site from the same tag.

A change to the site alone reaches gloss-format.org when you run the `pages` workflow by hand on the latest release tag. Don't run it on `main`: that would publish schema changes before they are released.
