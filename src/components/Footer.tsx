'use client'

import { useMemo } from 'react'

interface FooterProps {
  initialLang?: 'en' | 'ko'
}

export default function Footer({ initialLang: _initialLang = 'en' }: FooterProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="bg-primary text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Won Eui Hong</h3>
          <div className="border-t border-gray-700 pt-4 text-gray-400 text-sm">
            <p>&copy; {currentYear} Won Eui Hong. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

