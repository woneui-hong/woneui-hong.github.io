/**
 * Local admin API server (dev only).
 * Proxied from Next.js via rewrites so the static export build excludes API routes.
 */
const http = require('http')
const { URL } = require('url')
const { execSync } = require('child_process')
const { remark } = require('remark')
const remarkGfm = require('remark-gfm')
const remarkHtml = require('remark-html')

const {
  createSessionToken,
  verifyPassword,
  sessionCookieHeader,
  clearSessionCookieHeader,
  requireAuth,
  readBody,
} = require('./shared/admin-auth')

const {
  listAdminPosts,
  getAdminPost,
  saveAdminPost,
  deleteAdminPost,
  savePostImage,
} = require('./shared/admin-posts-api')

const { fetchLinkPreview } = require('./shared/link-preview')
const { preprocessEmbeds, extractPreviewUrls } = require('./shared/remark-embeds')

const PORT = Number(process.env.ADMIN_API_PORT || 3008)

function json(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(JSON.stringify(data))
}

async function handlePreview(content, slug) {
  const imageBasePath = `/posts/${slug}/res/images`
  let processedContent = content.replace(
    /!\[([^\]]*)\]\((\.\.\/)?res\/images\/([^)]+)\)/g,
    (_m, alt, _r, imageName) => `![${alt}](${imageBasePath}/${imageName})`
  )

  const previewUrls = extractPreviewUrls(processedContent)
  const linkPreviews = {}
  for (const url of previewUrls) {
    linkPreviews[url] = await fetchLinkPreview(url)
  }

  processedContent = preprocessEmbeds(processedContent, linkPreviews)
  const processedHtml = await remark()
    .use(remarkGfm.default || remarkGfm)
    .use(remarkHtml.default || remarkHtml)
    .process(processedContent)

  return processedHtml.toString()
}

async function handleMultipart(req) {
  const body = await readBody(req)
  const contentType = req.headers['content-type'] || ''
  const boundary = contentType.split('boundary=')[1]
  if (!boundary) throw new Error('Missing boundary')

  const parts = body.toString('binary').split(`--${boundary}`)
  let slug = ''
  let fileName = ''
  let fileBuffer = null

  for (const part of parts) {
    if (!part.includes('Content-Disposition')) continue
    const nameMatch = part.match(/name="([^"]+)"/)
    const filenameMatch = part.match(/filename="([^"]+)"/)
    const name = nameMatch?.[1]
    const headerEnd = part.indexOf('\r\n\r\n')
    if (headerEnd === -1) continue
    const value = part.slice(headerEnd + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '')

    if (name === 'slug') {
      slug = value.trim()
    } else if (name === 'file' && filenameMatch) {
      fileName = filenameMatch[1]
      fileBuffer = Buffer.from(value, 'binary')
    }
  }

  return { slug, fileName, fileBuffer }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname

  if (!pathname.startsWith('/api/admin')) {
    json(res, 404, { error: 'Not found' })
    return
  }

  try {
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString())
      if (!body.password || !verifyPassword(body.password)) {
        json(res, 401, { error: 'Invalid password' })
        return
      }
      const token = await createSessionToken()
      json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookieHeader(token) })
      return
    }

    if (pathname === '/api/admin/logout' && req.method === 'POST') {
      json(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookieHeader() })
      return
    }

    if (pathname === '/api/admin/session' && req.method === 'GET') {
      const cookies = require('./shared/admin-auth').parseCookies(req.headers.cookie)
      const session = await require('./shared/admin-auth').verifySessionToken(cookies.admin_session)
      json(res, 200, { authenticated: !!session?.authenticated })
      return
    }

    if (pathname === '/api/admin/link-preview' && req.method === 'GET') {
      if (!(await requireAuth(req, res))) return
      const targetUrl = url.searchParams.get('url')
      if (!targetUrl) {
        json(res, 400, { error: 'Missing url parameter' })
        return
      }
      try {
        new URL(targetUrl)
      } catch {
        json(res, 400, { error: 'Invalid URL' })
        return
      }
      const preview = await fetchLinkPreview(targetUrl)
      json(res, 200, preview)
      return
    }

    if (pathname === '/api/admin/preview' && req.method === 'POST') {
      if (!(await requireAuth(req, res))) return
      const body = JSON.parse((await readBody(req)).toString())
      const html = await handlePreview(body.content || '', body.slug || 'preview')
      json(res, 200, { html })
      return
    }

    if (pathname === '/api/admin/publish' && req.method === 'POST') {
      if (!(await requireAuth(req, res))) return
      execSync('node scripts/git-deploy.js', { stdio: 'pipe', cwd: process.cwd() })
      json(res, 200, { ok: true })
      return
    }

    if (pathname === '/api/admin/upload' && req.method === 'POST') {
      if (!(await requireAuth(req, res))) return
      const { slug, fileName, fileBuffer } = await handleMultipart(req)
      if (!slug || !fileName || !fileBuffer) {
        json(res, 400, { error: 'Missing slug or file' })
        return
      }
      const filename = savePostImage(slug, fileName, fileBuffer)
      json(res, 200, { filename, markdown: `![](../res/images/${filename})` })
      return
    }

    if (pathname === '/api/admin/posts' && req.method === 'GET') {
      if (!(await requireAuth(req, res))) return
      json(res, 200, listAdminPosts())
      return
    }

    if (pathname === '/api/admin/posts' && req.method === 'POST') {
      if (!(await requireAuth(req, res))) return
      const body = JSON.parse((await readBody(req)).toString())
      const result = await saveAdminPost(body)
      json(res, 200, result)
      return
    }

    const postMatch = pathname.match(/^\/api\/admin\/posts\/(.+)$/)
    if (postMatch) {
      const slug = decodeURIComponent(postMatch[1])

      if (req.method === 'GET') {
        if (!(await requireAuth(req, res))) return
        const post = getAdminPost(slug)
        if (!post) {
          json(res, 404, { error: 'Post not found' })
          return
        }
        json(res, 200, post)
        return
      }

      if (req.method === 'PUT') {
        if (!(await requireAuth(req, res))) return
        const body = JSON.parse((await readBody(req)).toString())
        const result = await saveAdminPost({ ...body, slug })
        json(res, 200, result)
        return
      }

      if (req.method === 'DELETE') {
        if (!(await requireAuth(req, res))) return
        const deleted = deleteAdminPost(slug)
        if (!deleted) {
          json(res, 404, { error: 'Post not found' })
          return
        }
        json(res, 200, { ok: true })
        return
      }
    }

    json(res, 404, { error: 'Not found' })
  } catch (error) {
    console.error('Admin API error:', error)
    json(res, 500, { error: error.message || 'Internal server error' })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Admin API listening on http://127.0.0.1:${PORT}`)
})
