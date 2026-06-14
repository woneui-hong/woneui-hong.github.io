const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-me'
}

function bufferToBase64Url(buffer) {
  return Buffer.from(buffer).toString('base64url')
}

function base64UrlToBuffer(base64url) {
  return Buffer.from(base64url, 'base64url')
}

async function sign(payload) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return bufferToBase64Url(new Uint8Array(signature))
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

async function createSessionToken() {
  const session = { authenticated: true, exp: Date.now() + SESSION_TTL_MS }
  const payload = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(session)))
  const signature = await sign(payload)
  return `${payload}.${signature}`
}

async function verifySessionToken(token) {
  if (!token) return null
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null

  const payload = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)
  const expected = await sign(payload)

  try {
    const sigBuf = base64UrlToBuffer(signature)
    const expBuf = base64UrlToBuffer(expected)
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null
    }
  } catch {
    return null
  }

  try {
    const json = base64UrlToBuffer(payload).toString('utf8')
    const session = JSON.parse(json)
    if (!session.authenticated || session.exp < Date.now()) return null
    return session
  } catch {
    return null
  }
}

function verifyPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  if (password.length !== adminPassword.length) return false
  let result = 0
  for (let i = 0; i < password.length; i++) {
    result |= password.charCodeAt(i) ^ adminPassword.charCodeAt(i)
  }
  return result === 0
}

function parseCookies(header) {
  const cookies = {}
  if (!header) return cookies
  header.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=')
    cookies[key] = decodeURIComponent(rest.join('='))
  })
  return cookies
}

function sessionCookieHeader(token) {
  const maxAge = SESSION_TTL_MS / 1000
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
}

async function requireAuth(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  const session = await verifySessionToken(cookies[SESSION_COOKIE])
  if (!session?.authenticated) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Unauthorized' }))
    return null
  }
  return session
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

module.exports = {
  createSessionToken,
  verifySessionToken,
  verifyPassword,
  parseCookies,
  sessionCookieHeader,
  clearSessionCookieHeader,
  requireAuth,
  readBody,
  SESSION_COOKIE,
}
