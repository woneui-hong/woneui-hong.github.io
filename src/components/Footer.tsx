'use client'

import { useMemo } from 'react'

export default function Footer() {
  // Use useMemo to ensure consistent value during hydration
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="bg-primary text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Won Eui Hong</h3>
          <p className="text-gray-300 text-sm mb-4">
            
          </p>
          <div className="border-t border-gray-700 pt-4 text-gray-400 text-sm">
            <p>&copy; {currentYear} Won Eui Hong. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

