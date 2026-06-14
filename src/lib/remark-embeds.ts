export interface LinkPreviewMeta {
  title?: string
  description?: string
  image?: string
  url?: string
}

function escapeHtml(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function buildLinkPreviewHtml(url: string, meta: LinkPreviewMeta = {}): string {
  const title = escapeHtml(meta.title || url)
  const description = escapeHtml(meta.description || '')
  const image = meta.image ? escapeHtml(meta.image) : ''
  const domain = escapeHtml(getDomain(url))
  const safeUrl = escapeHtml(url)

  const imageBlock = image
    ? `<div class="link-preview-card__image"><img src="${image}" alt="" loading="lazy" /></div>`
    : ''

  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="link-preview-card">
  ${imageBlock}
  <div class="link-preview-card__body">
    <p class="link-preview-card__title">${title}</p>
    ${description ? `<p class="link-preview-card__description">${description}</p>` : ''}
    <p class="link-preview-card__domain">${domain}</p>
  </div>
</a>`
}

export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0]
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2]
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2]
      }
      return parsed.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

export function getVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('vimeo.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean)
      return parts[parts.length - 1] || null
    }
  } catch {
    return null
  }
  return null
}

export function buildVideoEmbedHtml(url: string): string | null {
  const youtubeId = getYouTubeId(url)
  if (youtubeId) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}`
    return `<div class="video-embed"><iframe src="${embedUrl}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
  }

  const vimeoId = getVimeoId(url)
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}`
    return `<div class="video-embed"><iframe src="${embedUrl}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
  }

  return null
}

export function preprocessEmbeds(
  content: string,
  linkPreviews: Record<string, LinkPreviewMeta> = {}
): string {
  let processed = content.replace(/\[preview\]\(([^)]+)\)/g, (_match, url: string) => {
    const trimmed = url.trim()
    const meta = linkPreviews[trimmed] || {}
    return buildLinkPreviewHtml(trimmed, meta)
  })

  processed = processed.replace(/\[video\]\(([^)]+)\)/g, (_match, url: string) => {
    const trimmed = url.trim()
    const embed = buildVideoEmbedHtml(trimmed)
    return embed || _match
  })

  return processed
}

export function extractPreviewUrls(content: string): string[] {
  const urls: string[] = []
  const regex = /\[preview\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1].trim())
  }
  return urls
}
