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

  useEffect(() => {
    // If language matches initial language, use initial post (no fetch needed)
    if (language === initialLang) {
      setPost(initialPost)
      return
    }

    // Language changed - fetch new post data from JSON file
    setLoading(true)
    
    // Fetch metadata and content separately (new format) or fallback to old format
    // Use directory structure: content/en/2025/12/post-name.json
    const slugParts = slug.split('/')
    const fileName = slugParts[slugParts.length - 1] + '.json'
    const slugDir = slugParts.slice(0, -1).join('/')
    const contentPath = slugDir 
      ? `/posts-data/content/${language}/${slugDir}/${fileName}`
      : `/posts-data/content/${language}/${fileName}`
    const metadataPath = `/posts-data/${language}-metadata.json`
    const oldJsonPath = `/posts-data/${language}.json`
    
    // Try new format: fetch metadata and content separately
    Promise.all([
      fetch(metadataPath).then(res => res.ok ? res.json() : Promise.reject()),
      fetch(contentPath).then(res => res.ok ? res.json() : Promise.reject())
    ])
      .then(([metadataArray, contentData]: [Array<{ slug: string; metadata: any }>, { slug: string; contentHtml: string }]) => {
        // Find matching post in metadata
        const metadataItem = metadataArray.find((item: { slug: string }) => item.slug === slug)
        
        if (metadataItem && contentData) {
          const postData: Post = {
            slug: metadataItem.slug,
            metadata: metadataItem.metadata,
            content: initialPost.content, // Keep original content
            contentHtml: contentData.contentHtml,
          }
          setPost(postData)
        } else {
          throw new Error('Post not found in new format')
        }
        setLoading(false)
      })
      .catch(() => {
        // Fallback to old format: fetch all posts and find matching one
        fetch(oldJsonPath)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`)
            }
            return res.json()
          })
          .then((posts: Post[]) => {
            const foundPost = posts.find(p => p.slug === slug)
            
            if (foundPost) {
              const postData: Post = {
                slug: foundPost.slug,
                metadata: foundPost.metadata || {},
                content: foundPost.content || '',
                contentHtml: foundPost.contentHtml || ''
              }
              setPost(postData)
            } else {
              // If post not found, keep initial post
              setPost(initialPost)
            }
            setLoading(false)
          })
          .catch(() => {
            // If both fail, keep initial post
            setPost(initialPost)
            setLoading(false)
          })
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
            <span suppressHydrationWarning>
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
      ) : null}
    </>
  )
}

