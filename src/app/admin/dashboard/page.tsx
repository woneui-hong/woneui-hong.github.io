import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/admin-auth'
import { listAdminPosts } from '@/lib/admin-posts'
import PostList from '@/components/admin/PostList'

export const metadata = {
  title: 'Admin Dashboard - Won Eui Hong',
  robots: 'noindex, nofollow',
}

export default async function AdminDashboardPage() {
  const session = await getSessionFromCookies()
  if (!session?.authenticated) {
    redirect('/admin')
  }

  const posts = listAdminPosts()

  return <PostList posts={posts} />
}
