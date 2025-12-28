const fs = require('fs')
const path = require('path')

/**
 * Recursively copy images from content/posts to public/posts
 * Maintains the same folder structure
 */
function copyImagesRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    return
  }

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyImagesRecursive(srcPath, destPath)
    } else if (entry.isFile()) {
      // Copy image files (png, jpg, jpeg, gif, webp, svg)
      const ext = path.extname(entry.name).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
        // Ensure parent directory exists
        const parentDir = path.dirname(destPath)
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true })
        }
        fs.copyFileSync(srcPath, destPath)
        console.log(`Copied: ${srcPath} -> ${destPath}`)
      }
    }
  }
}

const contentPostsDir = path.join(process.cwd(), 'content/posts')
const publicPostsDir = path.join(process.cwd(), 'public/posts')

console.log('Copying images from content/posts to public/posts...')
copyImagesRecursive(contentPostsDir, publicPostsDir)
console.log('Image copy completed!')

