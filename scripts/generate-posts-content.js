const fs = require('fs')
const path = require('path')
const { getAllPostSlugs, getPostBySlug } = require('./shared/posts-utils')

async function generatePostsContent() {
  console.log('Generating individual post content JSON files...')
  
  const publicDir = path.join(process.cwd(), 'public', 'posts-data')
  const contentDir = path.join(publicDir, 'content')
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  // Create content directories
  const enContentDir = path.join(contentDir, 'en')
  const koContentDir = path.join(contentDir, 'ko')
  
  if (!fs.existsSync(enContentDir)) {
    fs.mkdirSync(enContentDir, { recursive: true })
  }
  if (!fs.existsSync(koContentDir)) {
    fs.mkdirSync(koContentDir, { recursive: true })
  }

  const slugs = getAllPostSlugs()
  let enCount = 0
  let koCount = 0

  // Process posts in batches to avoid memory issues
  const batchSize = 10
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(async (slug) => {
        // Process English version
        const enPost = await getPostBySlug(slug, 'en')
        if (enPost && enPost.metadata.published !== false) {
          // Create directory structure for slug (e.g., 2025/12/post-name.json)
          const slugParts = slug.split('/')
          const fileName = slugParts[slugParts.length - 1] + '.json'
          const slugDir = slugParts.slice(0, -1).join('/')
          
          const enSlugDir = slugDir ? path.join(enContentDir, slugDir) : enContentDir
          if (!fs.existsSync(enSlugDir)) {
            fs.mkdirSync(enSlugDir, { recursive: true })
          }
          
          const enContent = {
            slug: enPost.slug,
            contentHtml: enPost.contentHtml,
          }
          
          const enFilePath = path.join(enSlugDir, fileName)
          fs.writeFileSync(enFilePath, JSON.stringify(enContent, null, 2))
          enCount++
        }

        // Process Korean version
        const koPost = await getPostBySlug(slug, 'ko')
        if (koPost && koPost.metadata.published !== false) {
          // Create directory structure for slug (e.g., 2025/12/post-name.json)
          const slugParts = slug.split('/')
          const fileName = slugParts[slugParts.length - 1] + '.json'
          const slugDir = slugParts.slice(0, -1).join('/')
          
          const koSlugDir = slugDir ? path.join(koContentDir, slugDir) : koContentDir
          if (!fs.existsSync(koSlugDir)) {
            fs.mkdirSync(koSlugDir, { recursive: true })
          }
          
          const koContent = {
            slug: koPost.slug,
            contentHtml: koPost.contentHtml,
          }
          
          const koFilePath = path.join(koSlugDir, fileName)
          fs.writeFileSync(koFilePath, JSON.stringify(koContent, null, 2))
          koCount++
        }
      })
    )
    
    console.log(`Processed ${Math.min(i + batchSize, slugs.length)}/${slugs.length} posts...`)
  }

  console.log(`Generated ${enCount} English post content files`)
  console.log(`Generated ${koCount} Korean post content files`)
  console.log('Posts content generation completed!')
}

generatePostsContent().catch(console.error)

