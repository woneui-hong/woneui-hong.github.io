const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { remark } = require('remark')
const remarkGfm = require('remark-gfm')
const remarkHtml = require('remark-html')

const postsDirectory = path.join(process.cwd(), 'content/posts')

/**
 * Recursively find all markdown files in the posts directory
 * Supports yyyy/mm/post-name/en/post-name.md and yyyy/mm/post-name/ko/post-name.md structure
 */
function getAllMarkdownFiles(dir, basePath = '') {
  const files = []
  
  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      const enPath = path.join(fullPath, 'en')
      const koPath = path.join(fullPath, 'ko')
      
      if (fs.existsSync(enPath) || fs.existsSync(koPath)) {
        const dirName = entry.name
        const enMdFile = path.join(enPath, `${dirName}.md`)
        if (fs.existsSync(enMdFile)) {
          files.push({ filePath: enMdFile, slug: relativePath })
        } else {
          const koMdFile = path.join(koPath, `${dirName}.md`)
          if (fs.existsSync(koMdFile)) {
            files.push({ filePath: koMdFile, slug: relativePath })
          }
        }
      } else {
        const expectedMdFile = path.join(fullPath, `${entry.name}.md`)
        if (fs.existsSync(expectedMdFile)) {
          files.push({ filePath: expectedMdFile, slug: relativePath })
        } else {
          if (entry.name !== 'res' && entry.name !== 'en' && entry.name !== 'ko') {
            files.push(...getAllMarkdownFiles(fullPath, relativePath))
          }
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name === 'README.md' || entry.name === '_template.md') {
        continue
      }
      const slug = relativePath.replace(/\.md$/, '')
      files.push({ filePath: fullPath, slug })
    }
  }

  return files
}

/**
 * Get all post slugs
 */
function getAllPostSlugs() {
  const files = getAllMarkdownFiles(postsDirectory)
  return files.map((file) => file.slug)
}

/**
 * Get file path for a post slug and language
 */
function getPostFilePath(slug, lang = 'en') {
  const slugParts = slug.split('/')
  let fullPath

  if (slugParts.length >= 2) {
    const dirPath = path.join(postsDirectory, ...slugParts)
    const postName = slugParts[slugParts.length - 1]
    
    const enMdFile = path.join(dirPath, 'en', `${postName}.md`)
    const koMdFile = path.join(dirPath, 'ko', `${postName}.md`)
    
    const enExists = fs.existsSync(enMdFile)
    const koExists = fs.existsSync(koMdFile)
    
    if (lang === 'ko') {
      if (koExists) {
        fullPath = koMdFile
      } else if (enExists) {
        fullPath = enMdFile
      }
    } else if (lang === 'en') {
      if (enExists) {
        fullPath = enMdFile
      } else if (koExists) {
        fullPath = koMdFile
      }
    }
    
    if (!fullPath) {
      const expectedMdFile = path.join(dirPath, `${postName}.md`)
      if (fs.existsSync(expectedMdFile)) {
        fullPath = expectedMdFile
      } else {
        fullPath = path.join(postsDirectory, ...slugParts) + '.md'
      }
    }
  } else {
    fullPath = path.join(postsDirectory, `${slug}.md`)
  }
  
  if (!fullPath || !fs.existsSync(fullPath)) {
    return null
  }
  
  return fullPath
}

/**
 * Process markdown content: fix images and convert to HTML
 */
async function processMarkdown(content, slug) {
  // Process images
  const imageBasePath = `/posts/${slug}/res/images`
  let processedContent = content.replace(
    /!\[([^\]]*)\]\((\.\.\/)?res\/images\/([^)]+)\)/g,
    (match, alt, relative, imageName) => {
      const imagePath = `${imageBasePath}/${imageName}`
      return `![${alt}](${imagePath})`
    }
  )
  processedContent = processedContent.replace(
    /!\[([^\]]*)\]\((\.\/)?images\/([^)]+)\)/g,
    (match, alt, relative, imageName) => {
      const imagePath = `${imageBasePath}/${imageName}`
      return `![${alt}](${imagePath})`
    }
  )

  // Fix bold markdown syntax inside quotes
  processedContent = processedContent.replace(
    /\*\*(["'""])((?:(?!\*\*)[\s\S])+?)\1\*\*/g,
    (match, quote, text) => {
      return `<strong>${quote}${text}${quote}</strong>`
    }
  )
  processedContent = processedContent.replace(
    /\*\*(["'""])((?:(?!\*\*)[\s\S])+?)(["'""])\*\*/g,
    (match, quote1, text, quote2) => {
      return `<strong>${quote1}${text}${quote2}</strong>`
    }
  )

  // Convert markdown to HTML
  const processedHtml = await remark()
    .use(remarkGfm.default || remarkGfm)
    .use(remarkHtml.default || remarkHtml)
    .process(processedContent)

  return processedHtml.toString()
}

/**
 * Get post metadata only (without HTML processing)
 */
function getPostMetadata(slug, lang = 'en') {
  const filePath = getPostFilePath(slug, lang)
  if (!filePath) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)

  return {
    slug,
    metadata: data,
  }
}

/**
 * Get post with full content (metadata + HTML)
 */
async function getPostBySlug(slug, lang = 'en') {
  const filePath = getPostFilePath(slug, lang)
  if (!filePath) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  const contentHtml = await processMarkdown(content, slug)

  return {
    slug,
    metadata: data,
    content: content,
    contentHtml: contentHtml,
  }
}

/**
 * Parse date string (handles both YYYY-MM-DD and ISO 8601 formats)
 * Also handles Date objects from gray-matter parsing
 */
function parseDate(dateStr) {
  if (!dateStr) return null
  
  // Handle Date objects (from gray-matter parsing)
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear()
    const month = dateStr.getMonth() + 1
    const day = dateStr.getDate()
    return { year, month, day }
  }
  
  // Handle string types
  if (typeof dateStr !== 'string') return null
  
  // Handle ISO 8601 format: "2025-12-29T00:00:00.000Z" or "2025-12-29T00:00:00Z"
  if (dateStr.includes('T')) {
    const datePart = dateStr.split('T')[0]
    const parts = datePart.split('-')
    if (parts.length === 3) {
      const year = Number(parts[0])
      const month = Number(parts[1])
      const day = Number(parts[2])
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return { year, month, day }
      }
    }
  }
  
  // Handle YYYY-MM-DD format
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day }
    }
  }
  
  return null
}

/**
 * Parse time string (handles HH:mm format)
 */
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return { hour: 0, minute: 0 }
  
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hour = Number(parts[0])
    const minute = Number(parts[1])
    if (!isNaN(hour) && !isNaN(minute)) {
      return { hour, minute }
    }
  }
  
  return { hour: 0, minute: 0 }
}

/**
 * Sort posts by date (newer first)
 */
function sortPostsByDate(posts) {
  if (!posts || posts.length === 0) {
    return posts
  }
  
  try {
    // Create a copy to avoid mutating the original array
    const sorted = [...posts].sort((a, b) => {
      const dateA = a.metadata?.date
      const timeA = a.metadata?.time || '00:00'
      const dateB = b.metadata?.date
      const timeB = b.metadata?.time || '00:00'
      
      // Parse dates
      const parsedDateA = parseDate(dateA)
      const parsedDateB = parseDate(dateB)
      const parsedTimeA = parseTime(timeA)
      const parsedTimeB = parseTime(timeB)
      
      // If either date is invalid, put invalid ones at the end
      if (!parsedDateA || !parsedTimeA) {
        if (!parsedDateB || !parsedTimeB) return 0
        return 1 // A is invalid, put it after B
      }
      if (!parsedDateB || !parsedTimeB) {
        return -1 // B is invalid, put it after A
      }
      
      // Create Date objects (month is 0-indexed in JavaScript Date)
      const timestampA = new Date(
        parsedDateA.year, 
        parsedDateA.month - 1, 
        parsedDateA.day, 
        parsedTimeA.hour, 
        parsedTimeA.minute
      ).getTime()
      
      const timestampB = new Date(
        parsedDateB.year, 
        parsedDateB.month - 1, 
        parsedDateB.day, 
        parsedTimeB.hour, 
        parsedTimeB.minute
      ).getTime()
      
      // Compare timestamps (newer first = descending order)
      // timestampB - timestampA means:
      // - If B is newer (larger timestamp), result is positive → B comes first ✓
      // - If A is newer (larger timestamp), result is negative → A comes first ✓
      return timestampB - timestampA
    })
    
    return sorted
  } catch (error) {
    console.error('Error sorting posts:', error)
    return posts // Return unsorted posts if sorting fails
  }
}

module.exports = {
  getAllPostSlugs,
  getPostMetadata,
  getPostBySlug,
  processMarkdown,
  sortPostsByDate,
}

