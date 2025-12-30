import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AboutContent from '@/components/AboutContent'

// Force static generation only for production builds (static export)
// In development, allow dynamic rendering for language switching
export const dynamic = process.env.NODE_ENV === 'production' ? 'force-static' : 'auto'
export const dynamicParams = false

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <AboutContent />
      <Footer />
    </main>
  )
}

