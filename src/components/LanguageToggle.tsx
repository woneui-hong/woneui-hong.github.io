'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  // Show only the opposite language button
  const toggleLanguage = language === 'ko' ? 'en' : 'ko'
  const buttonText = language === 'ko' ? 'English' : '한국어'
  const ariaLabel = language === 'ko' ? 'Switch to English' : 'Switch to Korean'

  return (
    <button
      onClick={() => setLanguage(toggleLanguage)}
      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
      aria-label={ariaLabel}
    >
      {buttonText}
    </button>
  )
}

