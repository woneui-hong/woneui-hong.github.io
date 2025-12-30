const fs = require('fs')
const path = require('path')
const { getAllPostSlugs, getPostMetadata, sortPostsByDate } = require('./shared/posts-utils')

async function getAllPostsMetadata(lang = 'en') {
  try {
    const slugs = getAllPostSlugs()
    const posts = slugs
      .map((slug) => getPostMetadata(slug, lang))
      .filter((post) => post !== null && post.metadata.published !== false)
    
    return sortPostsByDate(posts)
  } catch (error) {
    console.error('Error getting all posts metadata:', error)
    return []
  }
}

async function generatePostsMetadata() {
  console.log('Generating posts metadata JSON files...')
  
  const publicDir = path.join(process.cwd(), 'public', 'posts-data')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Generate metadata for both languages
  const enPosts = await getAllPostsMetadata('en')
  const koPosts = await getAllPostsMetadata('ko')

  // Write metadata files (without contentHtml)
  const enMetadata = enPosts.map(({ slug, metadata }) => ({
    slug,
    metadata,
  }))

  const koMetadata = koPosts.map(({ slug, metadata }) => ({
    slug,
    metadata,
  }))

  fs.writeFileSync(
    path.join(publicDir, 'en-metadata.json'),
    JSON.stringify(enMetadata, null, 2)
  )
  console.log(`Generated en-metadata.json with ${enMetadata.length} posts`)

  fs.writeFileSync(
    path.join(publicDir, 'ko-metadata.json'),
    JSON.stringify(koMetadata, null, 2)
  )
  console.log(`Generated ko-metadata.json with ${koMetadata.length} posts`)

  console.log('Posts metadata generation completed!')
}

generatePostsMetadata().catch(console.error)

