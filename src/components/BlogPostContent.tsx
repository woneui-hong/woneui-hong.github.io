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
        return res.json()
      })
      .then((posts: Post[]) => {
        // Find the post with matching slug
        const foundPost = posts.find(p => p.slug === slug)
        console.log('Found post:', foundPost ? 'yes' : 'no')
        console.log('Post data:', foundPost ? {
          slug: foundPost.slug,
          title: foundPost.metadata?.title,
          hasContentHtml: !!foundPost.contentHtml,
          contentHtmlLength: foundPost.contentHtml?.length || 0,
          contentHtmlPreview: foundPost.contentHtml?.substring(0, 100)
        } : 'not found')
        
        if (foundPost) {
          // Ensure contentHtml exists and is not empty
          if (!foundPost.contentHtml || foundPost.contentHtml.trim() === '') {
            console.warn('Post found but contentHtml is missing or empty', {
              slug: foundPost.slug,
              hasContentHtml: !!foundPost.contentHtml,
              contentHtmlType: typeof foundPost.contentHtml
            })
          }
          // Create a new object to ensure React detects the change
          setPost({
            ...foundPost,
            metadata: { ...foundPost.metadata }
          })
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

