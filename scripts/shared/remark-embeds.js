function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function buildLinkPreviewHtml(url, meta = {}) {
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

function getYouTubeId(url) {
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

function getVimeoId(url) {
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

function buildVideoEmbedHtml(url) {
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

function preprocessEmbeds(content, linkPreviews = {}) {
  let processed = content.replace(/\[preview\]\(([^)]+)\)/g, (match, url) => {
    const trimmed = url.trim()
    const meta = linkPreviews[trimmed] || {}
    return buildLinkPreviewHtml(trimmed, meta)
  })

  processed = processed.replace(/\[video\]\(([^)]+)\)/g, (match, url) => {
    const trimmed = url.trim()
    const embed = buildVideoEmbedHtml(trimmed)
    return embed || match
  })

  return processed
}

function extractPreviewUrls(content) {
  const urls = []
  const regex = /\[preview\]\(([^)]+)\)/g
  let match
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1].trim())
  }
  return urls
}

module.exports = {
  escapeHtml,
  buildLinkPreviewHtml,
  buildVideoEmbedHtml,
  preprocessEmbeds,
  extractPreviewUrls,
  getYouTubeId,
  getVimeoId,
}
