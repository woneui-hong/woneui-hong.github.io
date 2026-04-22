/**
 * Copies post images, then writes public/posts-data/*.json from content/posts.
 * Run via npm prebuild; required before next build.
 */
const fs = require('fs')
const path = require('path')
const {
  getAllPostSlugs,
  getPostBySlug,
  getPostMetadata,
  sortPostsByDate,
} = require('./shared/posts-utils')

const ROOT = process.cwd()
const POSTS_DIR = path.join(ROOT, 'content/posts')
const PUBLIC_POSTS = path.join(ROOT, 'public/posts')
const POSTS_DATA = path.join(ROOT, 'public/posts-data')

function copyImagesRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    return
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyImagesRecursive(srcPath, destPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
        const parentDir = path.dirname(destPath)
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true })
        }
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}

function getAllPostsMetadata(lang) {
  const slugs = getAllPostSlugs()
  const posts = slugs
    .map((slug) => getPostMetadata(slug, lang))
    .filter((p) => p != null && p.metadata.published !== false)
  return sortPostsByDate(posts)
}

async function getAllPostsWithHtml(lang) {
  const slugs = getAllPostSlugs()
  const posts = await Promise.all(
    slugs.map((slug) => getPostBySlug(slug, lang))
  )
  return sortPostsByDate(
    posts.filter((p) => p != null && p.metadata.published !== false)
  )
}

function assertAllHaveContentHtml(posts, lang) {
  const bad = posts.filter((p) => !p.contentHtml || p.contentHtml.trim() === '')
  if (bad.length) {
    console.error(`Posts missing contentHtml in ${lang}:`)
    bad.forEach((p) => console.error(`  - ${p.slug}`))
    throw new Error(`Some posts are missing contentHtml (${lang})`)
  }
}

async function main() {
  console.log('Copying post images to public/posts …')
  copyImagesRecursive(POSTS_DIR, PUBLIC_POSTS)

  if (fs.existsSync(path.join(POSTS_DATA, 'content'))) {
    fs.rmSync(path.join(POSTS_DATA, 'content'), { recursive: true, force: true })
  }
  if (!fs.existsSync(POSTS_DATA)) {
    fs.mkdirSync(POSTS_DATA, { recursive: true })
  }

  const enMeta = getAllPostsMetadata('en').map(({ slug, metadata }) => ({ slug, metadata }))
  const koMeta = getAllPostsMetadata('ko').map(({ slug, metadata }) => ({ slug, metadata }))

  fs.writeFileSync(path.join(POSTS_DATA, 'en-metadata.json'), JSON.stringify(enMeta, null, 2))
  fs.writeFileSync(path.join(POSTS_DATA, 'ko-metadata.json'), JSON.stringify(koMeta, null, 2))
  console.log(`Wrote *-metadata.json (${enMeta.length} en, ${koMeta.length} ko)`)

  const enFull = await getAllPostsWithHtml('en')
  const koFull = await getAllPostsWithHtml('ko')
  assertAllHaveContentHtml(enFull, 'en')
  assertAllHaveContentHtml(koFull, 'ko')

  fs.writeFileSync(path.join(POSTS_DATA, 'en.json'), JSON.stringify(enFull, null, 2))
  fs.writeFileSync(path.join(POSTS_DATA, 'ko.json'), JSON.stringify(koFull, null, 2))
  console.log(`Wrote en.json / ko.json (${enFull.length} en, ${koFull.length} ko)`)
  console.log('build-posts-data: done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
