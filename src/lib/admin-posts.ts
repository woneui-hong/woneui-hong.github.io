import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { execSync } from 'child_process'
import { PostMetadata } from './posts'
import { extractPreviewUrls } from './remark-embeds'
import { fetchLinkPreview } from './link-preview'
import type { LinkPreviewMeta } from './remark-embeds'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface AdminPostSummary {
  slug: string
  postName: string
  metadata: PostMetadata
  hasEn: boolean
  hasKo: boolean
}

export interface AdminPostDetail {
  slug: string
  postName: string
  metadata: PostMetadata
  contentEn: string
  contentKo: string
  linkPreviews: Record<string, LinkPreviewMeta>
}

export interface SavePostInput {
  slug?: string
  postName: string
  date: string
  metadata: Partial<PostMetadata>
  contentEn: string
  contentKo: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getPostDirFromSlug(slug: string): string {
  return path.join(postsDirectory, ...slug.split('/'))
}

function getPostNameFromSlug(slug: string): string {
  const parts = slug.split('/')
  return parts[parts.length - 1]
}

function getMarkdownPath(slug: string, lang: 'en' | 'ko'): string {
  const postName = getPostNameFromSlug(slug)
  return path.join(getPostDirFromSlug(slug), lang, `${postName}.md`)
}

function readLangContent(slug: string, lang: 'en' | 'ko'): string {
  const filePath = getMarkdownPath(slug, lang)
  if (!fs.existsSync(filePath)) return ''
  const { content } = matter(fs.readFileSync(filePath, 'utf8'))
  return content
}

function readMetadata(slug: string): PostMetadata {
  for (const lang of ['en', 'ko'] as const) {
    const filePath = getMarkdownPath(slug, lang)
    if (fs.existsSync(filePath)) {
      const { data } = matter(fs.readFileSync(filePath, 'utf8'))
      return data as PostMetadata
    }
  }
  return {
    title: '',
    date: '',
    author: 'Won Eui Hong',
    category: 'Blog',
    tags: [],
    excerpt: '',
  }
}

function readLinkPreviews(slug: string): Record<string, LinkPreviewMeta> {
  for (const lang of ['en', 'ko'] as const) {
    const filePath = getMarkdownPath(slug, lang)
    if (fs.existsSync(filePath)) {
      const { data } = matter(fs.readFileSync(filePath, 'utf8'))
      return (data.linkPreviews as Record<string, LinkPreviewMeta>) || {}
    }
  }
  return {}
}

function getAllPostDirs(): string[] {
  const slugs: string[] = []

  function walk(dir: string, basePath: string) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        const enPath = path.join(fullPath, 'en')
        const koPath = path.join(fullPath, 'ko')
        if (fs.existsSync(enPath) || fs.existsSync(koPath)) {
          slugs.push(relativePath)
        } else if (entry.name !== 'res') {
          walk(fullPath, relativePath)
        }
      }
    }
  }

  walk(postsDirectory, '')
  return slugs
}

export function listAdminPosts(): AdminPostSummary[] {
  return getAllPostDirs().map((slug) => {
    const postName = getPostNameFromSlug(slug)
    const metadata = readMetadata(slug)
    return {
      slug,
      postName,
      metadata,
      hasEn: fs.existsSync(getMarkdownPath(slug, 'en')),
      hasKo: fs.existsSync(getMarkdownPath(slug, 'ko')),
    }
  })
}

export function getAdminPost(slug: string): AdminPostDetail | null {
  const postDir = getPostDirFromSlug(slug)
  if (!fs.existsSync(postDir)) return null

  return {
    slug,
    postName: getPostNameFromSlug(slug),
    metadata: readMetadata(slug),
    contentEn: readLangContent(slug, 'en'),
    contentKo: readLangContent(slug, 'ko'),
    linkPreviews: readLinkPreviews(slug),
  }
}

async function collectLinkPreviews(
  contentEn: string,
  contentKo: string,
  existing: Record<string, LinkPreviewMeta> = {}
): Promise<Record<string, LinkPreviewMeta>> {
  const urls = [...new Set([...extractPreviewUrls(contentEn), ...extractPreviewUrls(contentKo)])]
  const previews: Record<string, LinkPreviewMeta> = { ...existing }

  for (const url of urls) {
    if (!previews[url]?.title || previews[url].title === url) {
      previews[url] = await fetchLinkPreview(url)
    }
  }

  return previews
}

function buildMetadata(input: SavePostInput, linkPreviews: Record<string, LinkPreviewMeta>): PostMetadata & { linkPreviews?: Record<string, LinkPreviewMeta> } {
  const metadata: PostMetadata & { linkPreviews?: Record<string, LinkPreviewMeta> } = {
    title: input.metadata.title || input.postName,
    date: input.metadata.date || input.date,
    time: input.metadata.time,
    author: input.metadata.author || 'Won Eui Hong',
    category: input.metadata.category || 'Blog',
    tags: input.metadata.tags || [],
    excerpt: input.metadata.excerpt || '',
    featured: input.metadata.featured ?? false,
    published: input.metadata.published ?? true,
    series: input.metadata.series,
    part: input.metadata.part,
  }

  if (Object.keys(linkPreviews).length > 0) {
    metadata.linkPreviews = linkPreviews
  }

  return metadata
}

function writeLangFile(slug: string, lang: 'en' | 'ko', metadata: PostMetadata & { linkPreviews?: Record<string, LinkPreviewMeta> }, content: string) {
  const filePath = getMarkdownPath(slug, lang)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (content.trim()) {
    const fileContent = matter.stringify(content.trim() + '\n', metadata)
    fs.writeFileSync(filePath, fileContent, 'utf8')
  } else if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

function ensureImagesDir(slug: string): string {
  const imagesDir = path.join(getPostDirFromSlug(slug), 'res', 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
  return imagesDir
}

export function buildSlugFromInput(input: SavePostInput): string {
  if (input.slug) return input.slug
  const dateParts = input.date.split('-')
  const year = dateParts[0]
  const month = dateParts[1]
  const postName = slugify(input.postName)
  return `${year}/${month}/${postName}`
}

export async function saveAdminPost(input: SavePostInput): Promise<{ slug: string }> {
  const slug = buildSlugFromInput(input)
  const postDir = getPostDirFromSlug(slug)
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true })
  }
  ensureImagesDir(slug)

  const existing = input.slug ? readLinkPreviews(input.slug) : {}
  const linkPreviews = await collectLinkPreviews(input.contentEn, input.contentKo, existing)
  const metadata = buildMetadata(input, linkPreviews)

  writeLangFile(slug, 'en', metadata, input.contentEn)
  writeLangFile(slug, 'ko', metadata, input.contentKo)

  rebuildPostsData()
  return { slug }
}

export function deleteAdminPost(slug: string): boolean {
  const postDir = getPostDirFromSlug(slug)
  if (!fs.existsSync(postDir)) return false
  fs.rmSync(postDir, { recursive: true, force: true })
  rebuildPostsData()
  return true
}

export function rebuildPostsData() {
  execSync('node scripts/build-posts-data.js', { stdio: 'pipe', cwd: process.cwd() })
}

export function savePostImage(slug: string, filename: string, buffer: Buffer): string {
  ensureImagesDir(slug)
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  const destPath = path.join(getPostDirFromSlug(slug), 'res', 'images', safeName)
  fs.writeFileSync(destPath, buffer)
  rebuildPostsData()
  return safeName
}

export function getImagesDir(slug: string): string {
  return path.join(getPostDirFromSlug(slug), 'res', 'images')
}
