import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Tag, User, ArrowLeft } from 'lucide-react'

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  const params = slugs.map((slug) => ({
    slug: slug.split('/'), // Convert slug string to array for [...slug]
  }))
  
  // Ensure all paths are generated for static export
  if (process.env.NODE_ENV === 'production') {
    console.log('Generating static params for slugs:', slugs)
  }
  
  return params
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  const post = await getPostBySlug(slugString)

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

export default async function BlogPostPage({ params }: { params: { slug: string[] } }) {
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  const post = await getPostBySlug(slugString)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <article className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            <span>Back to Blog</span>
          </Link>

          {/* Post Header */}
          <header className="mb-8">
            {post.metadata.featured && (
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                Featured
              </span>
            )}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {post.metadata.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.metadata.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(post.metadata.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">
                  {post.metadata.category}
                </span>
              </div>
            </div>
            {post.metadata.tags && post.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                  >
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
              prose-li:text-gray-700 prose-li:mb-2
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
              prose-hr:border-gray-200 prose-hr:my-8"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </article>
      <Footer />
    </main>
  )
}

