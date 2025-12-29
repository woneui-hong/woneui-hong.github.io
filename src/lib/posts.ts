import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostMetadata {
  title: string
  date: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  featured?: boolean
}

export interface Post {
  slug: string
  metadata: PostMetadata
  content: string
  contentHtml: string
}

/**
 * Recursively find all markdown files in the posts directory
 * Supports yyyy/mm/post-name/en/post-name.md and yyyy/mm/post-name/ko/post-name.md structure
 */
function getAllMarkdownFiles(dir: string, basePath: string = ''): Array<{ filePath: string; slug: string }> {
  const files: Array<{ filePath: string; slug: string }> = []
  
  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      // Check if this directory contains en/ or ko/ subdirectories (new structure)
      const enPath = path.join(fullPath, 'en')
      const koPath = path.join(fullPath, 'ko')
      
      if (fs.existsSync(enPath) || fs.existsSync(koPath)) {
        // New structure: post-name/en/post-name.md or post-name/ko/post-name.md
        const dirName = entry.name
        
        // Check en folder first (default)
        const enMdFile = path.join(enPath, `${dirName}.md`)
        if (fs.existsSync(enMdFile)) {
          const slug = relativePath
          files.push({ filePath: enMdFile, slug })
        } else {
          // Fallback to ko folder if en doesn't exist
          const koMdFile = path.join(koPath, `${dirName}.md`)
          if (fs.existsSync(koMdFile)) {
            const slug = relativePath
            files.push({ filePath: koMdFile, slug })
          }
        }
      } else {
        // Legacy structure: check if directory contains a markdown file with the same name
        const expectedMdFile = path.join(fullPath, `${entry.name}.md`)
        
        if (fs.existsSync(expectedMdFile)) {
          // Directory contains a markdown file with the same name, use directory name as slug
          const slug = relativePath
          files.push({ filePath: expectedMdFile, slug })
        } else {
          // Recursively search in subdirectories (but skip res, en, ko folders)
          if (entry.name !== 'res' && entry.name !== 'en' && entry.name !== 'ko') {
            files.push(...getAllMarkdownFiles(fullPath, relativePath))
          }
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip template and README files
      if (entry.name === 'README.md' || entry.name === '_template.md') {
        continue
      }
      
      // Create slug from relative path (without .md extension)
      const slug = relativePath.replace(/\.md$/, '')
      files.push({ filePath: fullPath, slug })
    }
  }

  return files
}

export function getAllPostSlugs(): string[] {
  const files = getAllMarkdownFiles(postsDirectory)
  return files.map((file) => file.slug)
}

export async function getPostBySlug(slug: string, lang: 'en' | 'ko' = 'en'): Promise<Post | null> {
  // slug format: yyyy/mm/post-name or filename (for backward compatibility)
  const slugParts = slug.split('/')
  let fullPath: string | undefined

  if (slugParts.length >= 2) {
    // yyyy/mm/post-name format - check new structure first (en/ko folders)
    const dirPath = path.join(postsDirectory, ...slugParts)
    const postName = slugParts[slugParts.length - 1]
    
    // Check new structure: post-name/en/post-name.md or post-name/ko/post-name.md
    const enMdFile = path.join(dirPath, 'en', `${postName}.md`)
    const koMdFile = path.join(dirPath, 'ko', `${postName}.md`)
    
    const enExists = fs.existsSync(enMdFile)
    const koExists = fs.existsSync(koMdFile)
    
    // Try requested language first, then fallback
    if (lang === 'ko') {
      if (koExists) {
        fullPath = koMdFile
      } else if (enExists) {
        // Fallback to en if ko doesn't exist
        fullPath = enMdFile
      }
    } else if (lang === 'en') {
      if (enExists) {
        fullPath = enMdFile
      } else if (koExists) {
        // Fallback to ko if en doesn't exist
        fullPath = koMdFile
      }
    }
    
    // If still no path found, try legacy structure
    if (!fullPath) {
      // Legacy structure: check if it's a directory with post-name.md
      const expectedMdFile = path.join(dirPath, `${postName}.md`)
      
      if (fs.existsSync(expectedMdFile)) {
        // Directory with post-name.md file
        fullPath = expectedMdFile
      } else {
        // Regular markdown file (legacy format)
        fullPath = path.join(postsDirectory, ...slugParts) + '.md'
      }
    }
  } else {
    // Legacy format: just filename (for backward compatibility)
    fullPath = path.join(postsDirectory, `${slug}.md`)
  }
  
  if (!fullPath || !fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Replace relative image paths (../res/images/ or ./images/ or images/) with absolute paths
  // The slug is the directory path (e.g., "2025/12/2025-12-16-work-prioritization-signal-noise")
  // Use static path for GitHub Pages deployment (images are copied to public/posts during build)
  const imageBasePath = `/posts/${slug}/res/images`
  
  let processedContent = content.replace(
    /!\[([^\]]*)\]\((\.\.\/)?res\/images\/([^)]+)\)/g,
    (match, alt, relative, imageName) => {
      // Convert to API route or static path based on build mode
      const imagePath = `${imageBasePath}/${imageName}`
      return `![${alt}](${imagePath})`
    }
  )
  
  // Also handle legacy image paths for backward compatibility
  processedContent = processedContent.replace(
    /!\[([^\]]*)\]\((\.\/)?images\/([^)]+)\)/g,
    (match, alt, relative, imageName) => {
      // Convert to API route or static path based on build mode
      const imagePath = `${imageBasePath}/${imageName}`
      return `![${alt}](${imagePath})`
    }
  )

  const processedHtml = await remark()
    .use(remarkGfm)
    .use(html)
    .process(processedContent)
  const contentHtml = processedHtml.toString()

  return {
    slug,
    metadata: data as PostMetadata,
    content,
    contentHtml,
  }
}

export async function getAllPosts(lang: 'en' | 'ko' = 'en'): Promise<Post[]> {
  try {
    const slugs = getAllPostSlugs()
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const post = await getPostBySlug(slug, lang)
        return post
      })
    )

    // Filter out null posts and sort by date (newest first)
    const validPosts = posts.filter((post): post is Post => post !== null)
    
    return validPosts.sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime()
      const dateB = new Date(b.metadata.date).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error getting all posts:', error)
    return []
  }
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.metadata.featured === true)
}

