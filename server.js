import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDirectory = fileURLToPath(new URL('./dist/', import.meta.url))
const port = Number(process.env.PORT) || 3000
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (request, response) => {
  const requestPath = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname
  const relativePath = requestPath === '/admin' || requestPath.startsWith('/admin/')
    ? requestPath.replace(/^\/admin\/?/, 'admin/')
    : requestPath.slice(1)
  const safePath = normalize(relativePath).replace(/^\.([/\\]|$)/, '')
  let filePath = join(distDirectory, safePath || 'index.html')

  try {
    const fileInfo = await stat(filePath)
    if (!fileInfo.isFile()) throw new Error('Not a file')
  } catch {
    filePath = join(distDirectory, requestPath.startsWith('/admin') ? 'admin/index.html' : 'index.html')
  }

  response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' })
  createReadStream(filePath).pipe(response)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Questionnaire server listening on port ${port}`)
})