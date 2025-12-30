'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/posts'
import { Calendar, Tag, Menu, X } from 'lucide-react'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import BlogSidebar from './BlogSidebar'

interface PostsListProps {
  initialPosts: Post[]
  initialLang: 'en' | 'ko'
}

export default function PostsList({ initialPosts, initialLang }: PostsListProps) {
  // Always call hooks at the top level (React rules)
  const languageContext = useLanguage()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>(initialLang)
  const [isClient, setIsClient] = useState(false)
  
  // Filter states
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Use initialLang for initial render to avoid hydration mismatch
  // Then sync with context after client-side hydration
  const currentLanguage = isClient ? languageContext.language : initialLang

  // Ensure client-side only rendering for filter options to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    // Sync language state with context after hydration
    if (languageContext.language !== language) {
      setLanguage(languageContext.language)
    }
  }, [])

  // Sync language from context
  useEffect(() => {
    if (isClient && languageContext.language !== language) {
      setLanguage(languageContext.language)
    }
  }, [languageContext.language, isClient])

  useEffect(() => {
    // Skip if not client-side yet
    if (!isClient) return

    // If language matches initial language, use initial posts (no fetch needed)
    if (language === initialLang) {
      setPosts(initialPosts)
      return
    }

    // Language changed - fetch new posts data from JSON file
    setLoading(true)
    
    // In static export, load posts metadata from JSON files in public folder
    // Use new metadata format, fallback to old format for compatibility
    const metadataPath = `/posts-data/${language}-metadata.json`
    const oldJsonPath = `/posts-data/${language}.json`
    
    fetch(metadataPath)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch metadata: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          // Convert metadata format to Post format (add empty contentHtml for compatibility)
          const posts = data.map((item: { slug: string; metadata: any }) => ({
            slug: item.slug,
            metadata: item.metadata,
            content: '',
            contentHtml: '', // Not needed for list view
          }))
          setPosts(posts)
        } else {
          // If data format is invalid, try old format
          throw new Error('Invalid metadata format')
        }
        setLoading(false)
      })
      .catch(() => {
        // Fallback to old format for backward compatibility
        fetch(oldJsonPath)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`)
            }
            return res.json()
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              setPosts(data)
            } else {
              setPosts(initialPosts)
            }
            setLoading(false)
          })
          .catch(() => {
            // If both fail, keep initial posts
            setPosts(initialPosts)
            setLoading(false)
          })
      })
  }, [language, initialLang, initialPosts, isClient])


  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Stock filter
      if (selectedStock && (!post.metadata.tags || !post.metadata.tags.includes(selectedStock))) {
        return false
      }

      // Date filter
      if (selectedYear || selectedMonth) {
        if (!post.metadata.date) return false
        const postDate = new Date(post.metadata.date)
        const postYear = postDate.getFullYear().toString()
        const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0')
        
        if (selectedYear && postYear !== selectedYear) {
          return false
        }
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-')
          if (postYear !== year || postMonth !== month) {
            return false
          }
        }
      }

      // Tag filter
      if (selectedTag && (!post.metadata.tags || !post.metadata.tags.includes(selectedTag))) {
        return false
      }

      return true
    })
  }, [posts, selectedStock, selectedYear, selectedMonth, selectedTag])

  const clearFilters = () => {
    setSelectedStock('')
    setSelectedYear('')
    setSelectedMonth('')
    setSelectedTag('')
  }

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

  const hasActiveFilters = selectedStock || selectedYear || selectedMonth || selectedTag

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Menu Button */}
      {isClient && (
        <div className="lg:hidden mb-4 flex justify-end">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 font-medium"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span>{currentLanguage === 'ko' ? '메뉴' : 'Menu'}</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {[selectedStock, selectedYear, selectedMonth, selectedTag].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Results Count */}
        {hasActiveFilters && isClient && (
          <div className="mb-6 text-sm text-gray-600">
            {currentLanguage === 'ko' 
              ? `총 ${filteredPosts.length}개의 포스트가 표시됩니다`
              : `Showing ${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''}`
            }
          </div>
        )}

        {/* Posts Grid */}
        {!isClient ? (
        // Server-side: show initial posts without filtering to avoid hydration mismatch
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}${currentLanguage === 'ko' ? '?lang=ko' : ''}`}
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
                {post.metadata.series && post.metadata.part && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                      {post.metadata.series} - Part {post.metadata.part}
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.metadata.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span suppressHydrationWarning>
                      {new Date(post.metadata.date).toISOString().split('T')[0]}
                    </span>
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
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {currentLanguage === 'ko' ? '필터 조건에 맞는 포스트가 없습니다.' : 'No posts match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}${currentLanguage === 'ko' ? '?lang=ko' : ''}`}
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
                {post.metadata.series && post.metadata.part && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                      {post.metadata.series} - Part {post.metadata.part}
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.metadata.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span suppressHydrationWarning>
                      {isClient 
                        ? new Date(post.metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date(post.metadata.date).toISOString().split('T')[0]
                      }
                    </span>
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
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isClient && isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{currentLanguage === 'ko' ? '필터' : 'Filters'}</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
              <BlogSidebar
                posts={posts}
                selectedStock={selectedStock}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                selectedTag={selectedTag}
                onStockSelect={(stock) => {
                  setSelectedStock(stock)
                  setIsSidebarOpen(false)
                }}
                onYearSelect={(year) => {
                  setSelectedYear(year)
                  setIsSidebarOpen(false)
                }}
                onMonthSelect={(month) => {
                  setSelectedMonth(month)
                  setIsSidebarOpen(false)
                }}
                onTagSelect={(tag) => {
                  setSelectedTag(tag)
                  setIsSidebarOpen(false)
                }}
                onClear={() => {
                  clearFilters()
                  setIsSidebarOpen(false)
                }}
                language={currentLanguage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Right Side */}
      {isClient && (
        <div className="hidden lg:block">
          <BlogSidebar
            posts={posts}
            selectedStock={selectedStock}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedTag={selectedTag}
            onStockSelect={setSelectedStock}
            onYearSelect={setSelectedYear}
            onMonthSelect={setSelectedMonth}
            onTagSelect={setSelectedTag}
            onClear={clearFilters}
            language={currentLanguage}
          />
        </div>
      )}
    </div>
  )
}

