'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/posts'
import { Calendar, Tag, User, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BlogPostContentProps {
  slug: string
  initialPost: Post
  initialLang: 'en' | 'ko'
}

export default function BlogPostContent({ slug, initialPost, initialLang }: BlogPostContentProps) {
  const { language } = useLanguage()
  const [post, setPost] = useState<Post | null>(initialPost)
  const [loading, setLoading] = useState(false)

  // Debug: log post changes
  useEffect(() => {
    console.log('Post state updated:', {
      slug: post?.slug,
      title: post?.metadata?.title,
      hasContentHtml: !!post?.contentHtml,
      contentHtmlLength: post?.contentHtml?.length || 0,
      language
    })
  }, [post, language])

  useEffect(() => {
    // If language matches initial language, use initial post (no fetch needed)
    if (language === initialLang) {
      setPost(initialPost)
      return
    }

    // Language changed - fetch new post data from JSON file
    setLoading(true)
    
    // Fetch all posts for the language and find the matching one
    const jsonPath = `/posts-data/${language}.json`
    console.log('Fetching post data from:', jsonPath, 'for slug:', slug)
    
    fetch(jsonPath)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`)
        }
        return res.text() // First get as text to debug
      })
      .then(text => {
        console.log('Raw JSON response length:', text.length)
        console.log('Raw JSON preview:', text.substring(0, 500))
        try {
          const posts = JSON.parse(text)
          console.log('Parsed posts count:', posts.length)
          return posts
        } catch (e) {
          console.error('JSON parse error:', e)
          throw e
        }
      })
      .then((posts: any[]) => {
        // Find the post with matching slug
        const foundPost = posts.find(p => p.slug === slug)
        console.log('Found post:', foundPost ? 'yes' : 'no')
        
        // Deep inspection of the found post
        if (foundPost) {
          console.log('=== POST INSPECTION ===')
          console.log('All keys:', Object.keys(foundPost))
          console.log('contentHtml key exists:', 'contentHtml' in foundPost)
          console.log('contentHtml value:', foundPost.contentHtml)
          console.log('contentHtml type:', typeof foundPost.contentHtml)
          console.log('contentHtml length:', foundPost.contentHtml?.length || 0)
          console.log('contentHtml is empty string:', foundPost.contentHtml === '')
          console.log('contentHtml is null:', foundPost.contentHtml === null)
          console.log('contentHtml is undefined:', foundPost.contentHtml === undefined)
          
          // Check if contentHtml exists but is empty
          if (foundPost.contentHtml === '' || foundPost.contentHtml === null || foundPost.contentHtml === undefined) {
            console.error('ERROR: contentHtml is missing or empty!')
            console.log('Full post object:', JSON.stringify(foundPost, null, 2).substring(0, 1000))
          }
        }
        
        console.log('Post data summary:', foundPost ? {
          slug: foundPost.slug,
          title: foundPost.metadata?.title,
          hasContentHtml: !!foundPost.contentHtml,
          contentHtmlLength: foundPost.contentHtml?.length || 0,
          contentHtmlType: typeof foundPost.contentHtml,
          contentHtmlValue: foundPost.contentHtml?.substring(0, 50) || 'EMPTY',
          allKeys: Object.keys(foundPost || {})
        } : 'not found')
        
        if (foundPost) {
          // Check if contentHtml exists in the raw data
          const contentHtmlValue = foundPost.contentHtml
          
          if (!contentHtmlValue || contentHtmlValue.trim() === '') {
            console.error('CRITICAL: contentHtml is empty! Checking alternative fields...')
            // Maybe it's stored under a different key?
            console.log('Checking for content_html:', foundPost.content_html)
            console.log('Checking for contentHTML:', foundPost.contentHTML)
            console.log('Checking for html:', foundPost.html)
            console.log('Checking for htmlContent:', foundPost.htmlContent)
          }
          
          // Ensure all required fields are present
          const postData: Post = {
            slug: foundPost.slug,
            metadata: foundPost.metadata || {},
            content: foundPost.content || '',
            contentHtml: contentHtmlValue || foundPost.content_html || foundPost.contentHTML || foundPost.html || foundPost.htmlContent || ''
          }
          
          console.log('Final postData.contentHtml length:', postData.contentHtml?.length || 0)
          
          // Create a new object to ensure React detects the change
          setPost(postData)
        } else {
          // If post not found, keep initial post
          console.warn('Post not found for slug:', slug, 'in language:', language)
          console.log('Available slugs:', posts.map(p => p.slug))
          setPost(initialPost)
        }
        setLoading(false)
      })
      .catch((error) => {
        // If fetch fails, keep initial post
        console.error('Failed to load post for language:', language, error)
        setPost(initialPost)
        setLoading(false)
      })
  }, [language, initialLang, initialPost, slug])

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Post not found</p>
      </div>
    )
  }

  return (
    <>
      {/* Back Button */}
      <Link
        href={`/blog${language === 'ko' ? '?lang=ko' : ''}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        <span>Back to Blog</span>
      </Link>

      {/* Post Header */}
      <header className="mb-8">
        {post.metadata.featured && (
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary bg-primary/10 rounded-full">
            Featured
          </span>
        )}
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {post.metadata.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{post.metadata.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              {new Date(post.metadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">
              {post.metadata.category}
            </span>
          </div>
        </div>
        {post.metadata.tags && post.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post Content */}
      {post.contentHtml && post.contentHtml.trim() ? (
        <div
          key={`${post.slug}-${language}`}
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
            prose-li:text-gray-700 prose-li:mb-2
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
            prose-hr:border-gray-200 prose-hr:my-8"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Content not available</p>
          <p className="text-gray-400 text-sm mt-2">
            contentHtml: {post.contentHtml ? `exists (${post.contentHtml.length} chars)` : 'missing'}
          </p>
        </div>
      )}
    </>
  )
}

