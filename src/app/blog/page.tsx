import { getAllPosts } from '@/lib/posts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PostsList from '@/components/PostsList'
import { getLanguageFromServer } from '@/lib/lang'

export const metadata = {
  title: 'Blog - Won Eui Hong',
  description: 'Won Eui Hong\'s Blog',
}

// Force static generation only for production builds (static export)
// In development, allow dynamic rendering for language switching
export const dynamic = process.env.NODE_ENV === 'production' ? 'force-static' : 'auto'
export const dynamicParams = false

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  // In production (static export), use default 'en'
  // In development (localhost), use searchParams for language switching
  const lang = process.env.NODE_ENV === 'production' 
    ? 'en' 
    : (searchParams ? await getLanguageFromServer(searchParams) : 'en')

  const posts = await getAllPosts(lang)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Won Eui Hong
            </h1>

          </div>

          {/* Posts Grid */}
          <PostsList initialPosts={posts} initialLang={lang} />
        </div>
      </div>
      <Footer />
    </main>
  )
}


