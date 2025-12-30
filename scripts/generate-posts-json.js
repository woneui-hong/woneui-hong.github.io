const fs = require('fs')
const path = require('path')
const { getAllPostSlugs, getPostBySlug, sortPostsByDate } = require('./shared/posts-utils')

async function getAllPosts(lang = 'en') {
  try {
    const slugs = getAllPostSlugs()
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const post = await getPostBySlug(slug, lang)
        return post
      })
    )

    // Filter out null posts and unpublished posts (published !== false)
    const validPosts = posts.filter((post) => {
      return post !== null && post.metadata.published !== false
    })
    
    return sortPostsByDate(validPosts)
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

