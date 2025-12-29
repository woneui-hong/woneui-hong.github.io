'use client'

import { createContext, useContext, useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export type Language = 'en' | 'ko'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [language, setLanguageState] = useState<Language>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize language from cookie first (global state), then URL params, default to 'en'
  useEffect(() => {
    const langFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='))
      ?.split('=')[1] as Language | undefined
    
    const langFromUrl = searchParams.get('lang') as Language | null

    // Cookie takes priority as it represents global state
    const currentLang = langFromCookie || langFromUrl || 'en'
    
    // Only update state if it's different to prevent unnecessary re-renders
    // This prevents flickering when the URL changes but the language hasn't actually changed
    setLanguageState(prevLang => {
      if (prevLang === currentLang) {
        return prevLang
      }
      return currentLang
    })
    
    if (!isInitialized) {
      setIsInitialized(true)
    }
    
    // Update cookie if URL param is different and cookie doesn't exist
    if (!langFromCookie && langFromUrl) {
      document.cookie = `lang=${langFromUrl}; path=/; max-age=31536000`
    }
  }, [searchParams])

  const setLanguage = (lang: Language) => {
    // Don't update state if already the same language (prevents unnecessary reloads)
    if (language === lang) {
      return
    }
    
    // Save to cookie (global state) first
    document.cookie = `lang=${lang}; path=/; max-age=31536000` // 1 year
    
    // Build new URL with language parameter
    const params = new URLSearchParams(searchParams?.toString() || window.location.search.substring(1))
    params.set('lang', lang)
    const newUrl = `${pathname}?${params.toString()}`
    
    // Try client-side navigation first (works in development)
    // If that doesn't work (static export), the page will need to reload
    // We use router.push which will work in development, and fallback to reload if needed
    try {
      router.push(newUrl)
    } catch (error) {
      // Fallback: reload the page (for static export)
      window.location.href = newUrl
    }
  }

  // Don't render children until language is initialized
  if (!isInitialized) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Fallback: read from cookie or URL (should rarely happen if LanguageProvider is properly set up)
    if (typeof window !== 'undefined') {
      const langFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('lang='))
        ?.split('=')[1] as Language | undefined
      
      const langFromUrl = new URLSearchParams(window.location.search).get('lang') as Language | null
      const fallbackLang = langFromCookie || langFromUrl || 'en'
      
      return {
        language: fallbackLang,
        setLanguage: (lang: Language) => {
          // Don't update if already the same language
          if (fallbackLang === lang) {
            return
          }
          document.cookie = `lang=${lang}; path=/; max-age=31536000`
          const params = new URLSearchParams(window.location.search)
          params.set('lang', lang)
          const newUrl = `${window.location.pathname}?${params.toString()}`
          
          // Fallback: use window.location.replace (should rarely happen if LanguageProvider is set up)
          // In normal cases, LanguageProvider's setLanguage will be used instead
          window.location.replace(newUrl)
        }
      }
    }
    return {
      language: 'en' as Language,
      setLanguage: () => {}
    }
  }
  return context
}

