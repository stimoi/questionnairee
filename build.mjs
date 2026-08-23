import { build } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const distDirectory = new URL('./dist/', import.meta.url)
const distPath = fileURLToPath(distDirectory)

await rm(distDirectory, { recursive: true, force: true })
await mkdir(new URL('./assets/', distDirectory), { recursive: true })
await mkdir(new URL('./admin/assets/', distDirectory), { recursive: true })

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: `${distPath}/assets/questionnaire.js`,
})

await build({
  entryPoints: ['admin-panel/src/main.jsx'],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: `${distPath}/admin/assets/admin.js`,
})

const questionnaireHtml = (await readFile('index.html', 'utf8')).replace(
  '/src/main.jsx',
  '/assets/questionnaire.js',
)
const adminHtml = (await readFile('admin-panel/index.html', 'utf8')).replace(
  '/src/main.jsx',
  '/admin/assets/admin.js',
)

await writeFile(new URL('./index.html', distDirectory), questionnaireHtml)
await writeFile(new URL('./admin/index.html', distDirectory), adminHtml)