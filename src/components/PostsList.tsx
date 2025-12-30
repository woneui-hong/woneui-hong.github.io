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

// Helper function to parse date string (handles both YYYY-MM-DD and ISO 8601 formats)
// Also handles Date objects from gray-matter parsing
function parseDate(dateStr: string | Date | undefined | null): { year: number; month: number; day: number } | null {
  if (!dateStr) return null
  
  // Handle Date objects (from gray-matter parsing)
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear()
    const month = dateStr.getMonth() + 1
    const day = dateStr.getDate()
    return { year, month, day }
  }
  
  // Handle string types
  if (typeof dateStr !== 'string') return null
  
  // Handle ISO 8601 format: "2025-12-29T00:00:00.000Z" or "2025-12-29T00:00:00Z"
  if (dateStr.includes('T')) {
    const datePart = dateStr.split('T')[0]
    const parts = datePart.split('-')
    if (parts.length === 3) {
      const year = Number(parts[0])
      const month = Number(parts[1])
      const day = Number(parts[2])
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return { year, month, day }
      }
    }
  }
  
  // Handle YYYY-MM-DD format
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day }
    }
  }
  
  return null
}

// Helper function to parse time string (handles HH:mm format)
function parseTime(timeStr: string | undefined | null): { hour: number; minute: number } | null {
  if (!timeStr || typeof timeStr !== 'string') return { hour: 0, minute: 0 }
  
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hour = Number(parts[0])
    const minute = Number(parts[1])
    if (!isNaN(hour) && !isNaN(minute)) {
      return { hour, minute }
    }
  }
  
  return { hour: 0, minute: 0 }
}

// Helper function to sort posts by date and time (newer first)
function sortPostsByDate(posts: Post[]): Post[] {
  if (!posts || posts.length === 0) {
    return posts
  }
  
  try {
    // Create a copy and sort
    const sorted = [...posts].sort((a, b) => {
      const dateA = a.metadata?.date
      const timeA = a.metadata?.time || '00:00'
      const dateB = b.metadata?.date
      const timeB = b.metadata?.time || '00:00'
      
      // Parse dates
      const parsedDateA = parseDate(dateA)
      const parsedDateB = parseDate(dateB)
      const parsedTimeA = parseTime(timeA)
      const parsedTimeB = parseTime(timeB)
      
      // If either date is invalid, put invalid ones at the end
      if (!parsedDateA || !parsedTimeA) {
        if (!parsedDateB || !parsedTimeB) return 0
        return 1 // A is invalid, put it after B
      }
      if (!parsedDateB || !parsedTimeB) {
        return -1 // B is invalid, put it after A
      }
      
      // Create Date objects (month is 0-indexed in JavaScript Date)
      const timestampA = new Date(
        parsedDateA.year, 
        parsedDateA.month - 1, 
        parsedDateA.day, 
        parsedTimeA.hour, 
        parsedTimeA.minute
      ).getTime()
      
      const timestampB = new Date(
        parsedDateB.year, 
        parsedDateB.month - 1, 
        parsedDateB.day, 
        parsedTimeB.hour, 
        parsedTimeB.minute
      ).getTime()
      
      // Compare timestamps (newer first = descending order)
      // timestampB - timestampA means:
      // - If B is newer (larger timestamp), result is positive → B comes first ✓
      // - If A is newer (larger timestamp), result is negative → A comes first ✓
      return timestampB - timestampA
    })
    
    return sorted
  } catch (error) {
    console.error('Error sorting posts:', error)
    return posts // Return unsorted posts if sorting fails
  }
}

export default function PostsList({ initialPosts, initialLang }: PostsListProps) {
  // Always call hooks at the top level (React rules)
  const languageContext = useLanguage()
  const [posts, setPosts] = useState<Post[]>(sortPostsByDate(initialPosts))
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
      setPosts(sortPostsByDate(initialPosts))
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
          setPosts(sortPostsByDate(posts))
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
              setPosts(sortPostsByDate(data))
            } else {
              setPosts(sortPostsByDate(initialPosts))
            }
            setLoading(false)
          })
          .catch(() => {
            // If both fail, keep initial posts
            setPosts(sortPostsByDate(initialPosts))
            setLoading(false)
          })
      })
  }, [language, initialLang, initialPosts, isClient])


  // Filter and sort posts based on selected filters
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter(post => {
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

    // Sort by date and time (newer first)
    return filtered.sort((a, b) => {
      const dateA = a.metadata.date
      const timeA = a.metadata.time || '00:00'
      const dateB = b.metadata.date
      const timeB = b.metadata.time || '00:00'
      
      // Parse dates
      const parsedDateA = parseDate(dateA)
      const parsedDateB = parseDate(dateB)
      const parsedTimeA = parseTime(timeA)
      const parsedTimeB = parseTime(timeB)
      
      // If either date is invalid, keep original order
      if (!parsedDateA || !parsedDateB || !parsedTimeA || !parsedTimeB) {
        return 0
      }
      
      // Create Date objects (month is 0-indexed in JavaScript Date)
      const timestampA = new Date(
        parsedDateA.year, 
        parsedDateA.month - 1, 
        parsedDateA.day, 
        parsedTimeA.hour, 
        parsedTimeA.minute
      ).getTime()
      
      const timestampB = new Date(
        parsedDateB.year, 
        parsedDateB.month - 1, 
        parsedDateB.day, 
        parsedTimeB.hour, 
        parsedTimeB.minute
      ).getTime()
      
      // Return negative if B is newer (B should come first)
      // Return positive if A is newer (A should come first)
      // For descending order (newer first): return timestampB - timestampA
      return timestampB - timestampA
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
          {sortPostsByDate(posts).map((post) => (
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
                  {post.metadata.category && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                        {post.metadata.category}
                      </span>
                    </div>
                  )}
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
                  {post.metadata.category && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                        {post.metadata.category}
                      </span>
                    </div>
                  )}
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

