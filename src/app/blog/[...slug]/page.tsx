import { notFound } from 'next/navigation'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogPostContent from '@/components/BlogPostContent'
import { getLanguageFromServer } from '@/lib/lang'

/** Reserved slug so `output: "export"` can build when there are zero posts (catch-all must emit at least one path). */
const EMPTY_BLOG_PLACEHOLDER = '__empty__'

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  if (slugs.length === 0) {
    return [{ slug: [EMPTY_BLOG_PLACEHOLDER] }]
  }
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }))
}

export async function generateMetadata({ 
  params,
}: { 
  params: { slug: string[] }
}) {
  // generateMetadata runs at build time, so we use default 'en' language
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  const post = await getPostBySlug(slugString, 'en')

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.metadata.title} - Won Eui Hong`,
    description: post.metadata.excerpt,
  }
}

export default async function BlogPostPage({ 
  params,
  searchParams,
}: { 
  params: { slug: string[] }
  searchParams?: { lang?: string }
}) {
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug

  if (slugString === EMPTY_BLOG_PLACEHOLDER) {
    notFound()
  }
  
  // In production (static export), use default 'en'
  // In development (localhost), use searchParams for language switching
  const lang = process.env.NODE_ENV === 'production' 
    ? 'en' 
    : (searchParams ? await getLanguageFromServer(searchParams) : 'en')
  
  const post = await getPostBySlug(slugString, lang)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <article className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <BlogPostContent slug={slugString} initialPost={post} initialLang={lang} />
        </div>
      </article>
      <Footer />
    </main>
  )
}

