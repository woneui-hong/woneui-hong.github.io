'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Languages } from 'lucide-react'

export type Language = 'en' | 'ko'

export default function LanguageToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [language, setLanguage] = useState<Language>('en')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Get language from URL params or cookie
    const langFromUrl = searchParams.get('lang') as Language | null
    const langFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='))
      ?.split('=')[1] as Language | undefined

    const currentLang = langFromUrl || langFromCookie || 'en'
    setLanguage(currentLang)
  }, [searchParams])

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ko' : 'en'
    
    // Save to cookie
    document.cookie = `lang=${newLang}; path=/; max-age=31536000` // 1 year
    
    // Update URL with language parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', newLang)
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
      router.refresh()
    })
  }

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Toggle language"
    >
      <Languages size={16} />
      <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'KO'}</span>
      <span className="sm:hidden">{language === 'en' ? 'EN' : 'KO'}</span>
    </button>
  )
}

