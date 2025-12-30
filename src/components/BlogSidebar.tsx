'use client'

import { useMemo } from 'react'
import { Post } from '@/lib/posts'
import { Calendar, Tag, TrendingUp, X } from 'lucide-react'
import { Language } from '@/contexts/LanguageContext'

interface BlogSidebarProps {
  posts: Post[]
  selectedStock: string
  selectedYear: string
  selectedMonth: string
  selectedTag: string
  onStockSelect: (stock: string) => void
  onYearSelect: (year: string) => void
  onMonthSelect: (month: string) => void
  onTagSelect: (tag: string) => void
  onClear: () => void
  language: Language
}

export default function BlogSidebar({
  posts,
  selectedStock,
  selectedYear,
  selectedMonth,
  selectedTag,
  onStockSelect,
  onYearSelect,
  onMonthSelect,
  onTagSelect,
  onClear,
  language,
}: BlogSidebarProps) {
  // Extract filter options from posts
  const filterOptions = useMemo(() => {
    const stocks = new Set<string>()
    const tags = new Set<string>()
    const years = new Set<string>()
    const months = new Set<string>()

    posts.forEach(post => {
      // Extract stocks (tags that are uppercase letters only, 2-5 characters)
      if (post.metadata.tags) {
        post.metadata.tags.forEach(tag => {
          // Check if tag looks like a stock ticker (uppercase letters, 2-5 chars)
          if (/^[A-Z]{2,5}$/.test(tag)) {
            stocks.add(tag)
          }
          tags.add(tag)
        })
      }

      // Extract year and month from date
      if (post.metadata.date) {
        const date = new Date(post.metadata.date)
        const year = date.getFullYear().toString()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        years.add(year)
        months.add(`${year}-${month}`)
      }
    })

    return {
      stocks: Array.from(stocks).sort(),
      tags: Array.from(tags).sort(),
      years: Array.from(years).sort().reverse(),
      months: Array.from(months).sort().reverse(),
    }
  }, [posts])

  const hasActiveFilters = selectedStock || selectedYear || selectedMonth || selectedTag

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="space-y-6">
        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            >
              <X size={16} />
              <span>{language === 'ko' ? '필터 초기화' : 'Clear Filters'}</span>
            </button>
          </div>
        )}

        {/* Stocks Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <TrendingUp size={16} />
            <span>{language === 'ko' ? '종목' : 'Stocks'}</span>
          </h3>
          <div className="space-y-1">
            {filterOptions.stocks.length > 0 ? (
              filterOptions.stocks.map(stock => (
                <button
                  key={stock}
                  onClick={() => onStockSelect(selectedStock === stock ? '' : stock)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedStock === stock
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {stock}
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500 px-3 py-2">
                    {language === 'ko' ? '종목 없음' : 'No stocks'}
                  </p>
            )}
          </div>
        </div>

        {/* Years Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Calendar size={16} />
            <span>{language === 'ko' ? '연도' : 'Years'}</span>
          </h3>
          <div className="space-y-1">
            {filterOptions.years.length > 0 ? (
              filterOptions.years.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    if (selectedYear === year) {
                      onYearSelect('')
                      onMonthSelect('')
                    } else {
                      onYearSelect(year)
                      onMonthSelect('')
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedYear === year
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500 px-3 py-2">
                {language === 'ko' ? '연도 없음' : 'No years'}
              </p>
            )}
          </div>
        </div>

        {/* Months Section - Only show if year is selected */}
        {selectedYear && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Calendar size={16} />
              <span>{language === 'ko' ? '월' : 'Months'}</span>
            </h3>
            <div className="space-y-1">
              {filterOptions.months
                .filter(month => month.startsWith(selectedYear))
                .map(month => {
                  const [, monthNum] = month.split('-')
                  const monthNames = language === 'ko' 
                    ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  return (
                    <button
                      key={month}
                      onClick={() => onMonthSelect(selectedMonth === month ? '' : month)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedMonth === month
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {monthNames[parseInt(monthNum) - 1]} {selectedYear}
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Tag size={16} />
            <span>{language === 'ko' ? '태그' : 'Tags'}</span>
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filterOptions.tags.length > 0 ? (
              filterOptions.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagSelect(selectedTag === tag ? '' : tag)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500 px-3 py-2">
                {language === 'ko' ? '태그 없음' : 'No tags'}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

