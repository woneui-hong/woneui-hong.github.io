import { getAllPosts, Post } from '@/lib/posts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PostsList from '@/components/PostsList'
import { getLanguageFromServer } from '@/lib/lang'

// Force static generation only for production builds (static export)
// In development, allow dynamic rendering for language switching
export const dynamic = process.env.NODE_ENV === 'production' ? 'force-static' : 'auto'
export const dynamicParams = false

export default async function Home({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  // In production (static export), use default 'en'
  // In development (localhost), use searchParams for language switching
  const lang = process.env.NODE_ENV === 'production' 
    ? 'en' 
    : (searchParams ? await getLanguageFromServer(searchParams) : 'en')

  let posts: Post[] = []
  try {
    posts = await getAllPosts(lang)
  } catch (error) {
    posts = []
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PostsList initialPosts={posts} initialLang={lang} />
        </div>
      </div>
      <Footer />
    </main>
  )
}

