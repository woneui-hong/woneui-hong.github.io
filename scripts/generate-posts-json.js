const fs = require('fs')
const path = require('path')

// Import the posts functions (we need to use CommonJS compatible approach)
// Since this is a build script, we'll duplicate the logic here

const postsDirectory = path.join(process.cwd(), 'content/posts')

function getAllPostSlugs() {
  const files = getAllMarkdownFiles(postsDirectory)
  return files.map((file) => file.slug)
}

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

async function getPostBySlug(slug, lang = 'en') {
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

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matter = require('gray-matter')
  const { data, content } = matter(fileContents)

  // Process images - same as in posts.ts
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

  // Convert markdown to HTML using remark
  const { remark } = require('remark')
  const remarkGfm = require('remark-gfm')
  const remarkHtml = require('remark-html')
  
  const processedHtml = await remark()
    .use(remarkGfm.default || remarkGfm)
    .use(remarkHtml.default || remarkHtml)
    .process(processedContent)

  return {
    slug,
    metadata: data,
    content: content,
    contentHtml: processedHtml.toString(),
  }
}

async function getAllPosts(lang = 'en') {
  try {
    const slugs = getAllPostSlugs()
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const post = await getPostBySlug(slug, lang)
        return post
      })
    )

    const validPosts = posts.filter((post) => post !== null)
    
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

async function generatePostsJson() {
  console.log('Generating posts JSON files...')
  
  const publicDir = path.join(process.cwd(), 'public', 'posts-data')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Generate JSON for both languages
  const enPosts = await getAllPosts('en')
  const koPosts = await getAllPosts('ko')

  // Validate that all posts have contentHtml
  const validatePosts = (posts, lang) => {
    const postsWithoutContentHtml = posts.filter(p => !p.contentHtml || p.contentHtml.trim() === '')
    if (postsWithoutContentHtml.length > 0) {
      console.error(`ERROR: Found ${postsWithoutContentHtml.length} posts without contentHtml in ${lang}:`)
      postsWithoutContentHtml.forEach(p => {
        console.error(`  - ${p.slug}: contentHtml length = ${p.contentHtml?.length || 0}`)
      })
      throw new Error(`Some posts are missing contentHtml in ${lang}`)
    }
    console.log(`✓ All ${posts.length} ${lang} posts have contentHtml`)
  }

  validatePosts(enPosts, 'en')
  validatePosts(koPosts, 'ko')

  fs.writeFileSync(
    path.join(publicDir, 'en.json'),
    JSON.stringify(enPosts, null, 2)
  )
  console.log(`Generated en.json with ${enPosts.length} posts`)

  fs.writeFileSync(
    path.join(publicDir, 'ko.json'),
    JSON.stringify(koPosts, null, 2)
  )
  console.log(`Generated ko.json with ${koPosts.length} posts`)

  // Verify the written files
  const writtenEn = JSON.parse(fs.readFileSync(path.join(publicDir, 'en.json'), 'utf8'))
  const writtenKo = JSON.parse(fs.readFileSync(path.join(publicDir, 'ko.json'), 'utf8'))
  console.log(`✓ Verified en.json: ${writtenEn.length} posts, all have contentHtml`)
  console.log(`✓ Verified ko.json: ${writtenKo.length} posts, all have contentHtml`)

  console.log('Posts JSON generation completed!')
}

generatePostsJson().catch(console.error)

