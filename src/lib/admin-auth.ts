import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export interface AdminSession {
  authenticated: boolean
  exp: number
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-me'
}

function bufferToBase64Url(buffer: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function sign(payload: string): Promise<string> {
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

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

export async function createSessionToken(): Promise<string> {
  const session: AdminSession = {
    authenticated: true,
    exp: Date.now() + SESSION_TTL_MS,
  }
  const payload = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(session)))
  const signature = await sign(payload)
  return `${payload}.${signature}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null

  const payload = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)
  if (!payload || !signature) return null

  const expected = await sign(payload)
  try {
    const sigBuf = base64UrlToBuffer(signature)
    const expBuf = base64UrlToBuffer(expected)
    if (!timingSafeEqual(sigBuf, expBuf)) {
      return null
    }
  } catch {
    return null
  }

  try {
    const json = new TextDecoder().decode(base64UrlToBuffer(payload))
    const session = JSON.parse(json) as AdminSession
    if (!session.authenticated || session.exp < Date.now()) {
      return null
    }
    return session
  } catch {
    return null
  }
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false

  if (password.length !== adminPassword.length) return false

  let result = 0
  for (let i = 0; i < password.length; i++) {
    result |= password.charCodeAt(i) ^ adminPassword.charCodeAt(i)
  }
  return result === 0
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export async function getSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  }
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  }
}
