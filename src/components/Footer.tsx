'use client'

import { useMemo, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FooterProps {
  initialLang?: 'en' | 'ko'
}

export default function Footer({ initialLang = 'en' }: FooterProps) {
  // Use useMemo to ensure consistent value during hydration
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [isMounted, setIsMounted] = useState(false)
  const { language } = useLanguage()
  
  // Mark as mounted after first render (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Use initialLang for initial render to prevent hydration mismatch
  // Only use language from context after mount
  const currentLang = isMounted ? language : initialLang

  const disclaimer = currentLang === 'ko' 
    ? '본 블로그는 투자 권유가 아니며, 투자 결정 및 그에 따른 손실에 대한 책임은 모두 투자자 본인에게 있습니다.'
    : 'This blog does not constitute investment advice. All investment decisions and any losses resulting therefrom are the sole responsibility of the investor.'

  return (
    <footer className="bg-primary text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Won Eui Hong</h3>
          <p className="text-gray-300 text-sm mb-4">
            {disclaimer}
          </p>
          <div className="border-t border-gray-700 pt-4 text-gray-400 text-sm">
            <p>&copy; {currentYear} Won Eui Hong. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

