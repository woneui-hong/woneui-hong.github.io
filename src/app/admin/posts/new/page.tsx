import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/admin-auth'
import PostEditor from '@/components/admin/PostEditor'

export const metadata = {
  title: 'New Post - Admin',
  robots: 'noindex, nofollow',
}

export default async function NewPostPage() {
  const session = await getSessionFromCookies()
  if (!session?.authenticated) {
    redirect('/admin')
  }

  return <PostEditor mode="create" />
}
