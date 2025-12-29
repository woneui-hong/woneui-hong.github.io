'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/posts'
import { Calendar, Tag, User } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface PostsListProps {
  initialPosts: Post[]
  initialLang: 'en' | 'ko'
}

export default function PostsList({ initialPosts, initialLang }: PostsListProps) {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If language matches initial language, use initial posts (no fetch needed)
    if (language === initialLang) {
      setPosts(initialPosts)
      return
    }

    // Language changed - fetch new posts data from JSON file
    setLoading(true)
    
    // In static export, load posts data from JSON files in public folder
    fetch(`/posts-data/${language}.json`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setPosts(data)
        } else {
          // If data format is invalid, keep initial posts
          console.warn('Invalid posts data format, keeping initial posts')
          setPosts(initialPosts)
        }
        setLoading(false)
      })
      .catch((error) => {
        // If fetch fails (e.g., JSON file doesn't exist), keep initial posts
        console.warn('Failed to load posts for language:', language, error)
        setPosts(initialPosts)
        setLoading(false)
      })
  }, [language, initialLang, initialPosts])

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}${language === 'ko' ? '?lang=ko' : ''}`}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
        >
          <div className="p-6">
            {post.metadata.featured && (
              <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                Featured
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
              {post.metadata.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.metadata.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(post.metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{post.metadata.author}</span>
              </div>
            </div>
            {post.metadata.tags && post.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.metadata.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

