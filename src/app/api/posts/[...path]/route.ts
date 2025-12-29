import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the path from the array
    const pathSegments = params.path || []
    const imagePath = pathSegments.join('/')
    
    // Construct the full file path in the content directory
    const contentPostsDir = path.join(process.cwd(), 'content/posts')
    const fullPath = path.join(contentPostsDir, imagePath)
    
    // Security: Ensure the path is within the content/posts directory
    const normalizedPath = path.normalize(fullPath)
    const normalizedContentDir = path.normalize(contentPostsDir)
    
    if (!normalizedPath.startsWith(normalizedContentDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedPath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(normalizedPath)
    
    // Determine content type based on file extension
    const ext = path.extname(normalizedPath).toLowerCase()
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream'
    
    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

