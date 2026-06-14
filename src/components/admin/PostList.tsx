'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Edit, Eye, EyeOff } from 'lucide-react'

export interface AdminPostListItem {
  slug: string
  postName: string
  metadata: {
    title: string
    date: string
    published?: boolean
  }
  hasEn: boolean
  hasKo: boolean
}

interface PostListProps {
  posts: AdminPostListItem[]
}

export default function PostList({ posts }: PostListProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Blog Admin</h1>
            <p className="text-sm text-gray-500">Manage your posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              View site
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            New post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No posts yet.</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Plus size={16} />
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.slug} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {post.metadata.title || post.postName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{post.metadata.date}</span>
                    <span className="flex items-center gap-1">
                      {post.hasEn && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">EN</span>}
                      {post.hasKo && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">KO</span>}
                    </span>
                    {post.metadata.published === false ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <EyeOff size={14} />
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Eye size={14} />
                        Published
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/posts/${post.slug.split('/').map(encodeURIComponent).join('/')}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors shrink-0"
                >
                  <Edit size={14} />
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
