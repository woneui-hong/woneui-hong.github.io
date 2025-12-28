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
 * Supports yyyy/mm folder structure and post-name/post-name.md structure
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
      // Check if directory contains a markdown file with the same name as the directory
      const dirName = entry.name
      const expectedMdFile = path.join(fullPath, `${dirName}.md`)
      
      if (fs.existsSync(expectedMdFile)) {
        // Directory contains a markdown file with the same name, use directory name as slug
        const slug = relativePath
        files.push({ filePath: expectedMdFile, slug })
      } else {
        // Recursively search in subdirectories
        files.push(...getAllMarkdownFiles(fullPath, relativePath))
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

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // slug format: yyyy/mm/post-name or filename (for backward compatibility)
  const slugParts = slug.split('/')
  let fullPath: string

  if (slugParts.length >= 2) {
    // yyyy/mm/post-name format - check if it's a directory with post-name.md
    const dirPath = path.join(postsDirectory, ...slugParts)
    const postName = slugParts[slugParts.length - 1]
    const expectedMdFile = path.join(dirPath, `${postName}.md`)
    
    if (fs.existsSync(expectedMdFile)) {
      // Directory with post-name.md file
      fullPath = expectedMdFile
    } else {
      // Regular markdown file (legacy format)
      fullPath = path.join(postsDirectory, ...slugParts) + '.md'
    }
  } else {
    // Legacy format: just filename (for backward compatibility)
    fullPath = path.join(postsDirectory, `${slug}.md`)
  }
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Replace relative image paths (./images/ or images/) with absolute paths
  // The slug is the directory path (e.g., "2025/12/2025-12-16-work-prioritization-signal-noise")
  let processedContent = content.replace(
    /!\[([^\]]*)\]\((\.\/)?images\/([^)]+)\)/g,
    (match, alt, relative, imageName) => {
      // Convert to absolute path: /posts/yyyy/mm/post-name/images/image.png
      const imagePath = `/posts/${slug}/images/${imageName}`
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

export async function getAllPosts(): Promise<Post[]> {
  const slugs = getAllPostSlugs()
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug)
      return post!
    })
  )

  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.date).getTime()
    const dateB = new Date(b.metadata.date).getTime()
    return dateB - dateA
  })
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.metadata.featured === true)
}

