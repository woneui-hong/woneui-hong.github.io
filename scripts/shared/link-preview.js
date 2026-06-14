function extractMetaContent(html, key, attr = 'property') {
  const patterns = [
    new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function extractTitle(html) {
  const ogTitle = extractMetaContent(html, 'og:title')
  if (ogTitle) return ogTitle
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch?.[1]?.trim() || null
}

function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).href
  } catch {
    return relative
  }
}

async function fetchLinkPreview(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { url, title: url }
    }

    const html = await response.text()
    const title = extractMetaContent(html, 'og:title') || extractTitle(html) || url
    const description =
      extractMetaContent(html, 'og:description') ||
      extractMetaContent(html, 'description', 'name') ||
      ''
    const imageRaw =
      extractMetaContent(html, 'og:image') ||
      extractMetaContent(html, 'twitter:image') ||
      extractMetaContent(html, 'twitter:image', 'name') ||
      ''
    const image = imageRaw ? resolveUrl(url, imageRaw) : undefined

    return { url, title, description, image }
  } catch {
    return { url, title: url }
  }
}

module.exports = { fetchLinkPreview }
