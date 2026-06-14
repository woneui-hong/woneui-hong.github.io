import { redirect, notFound } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/admin-auth'
import { getAdminPost } from '@/lib/admin-posts'
import PostEditor from '@/components/admin/PostEditor'

export const metadata = {
  title: 'Edit Post - Admin',
  robots: 'noindex, nofollow',
}

export default async function EditPostPage({
  params,
}: {
  params: { slug: string[] }
}) {
  const session = await getSessionFromCookies()
  if (!session?.authenticated) {
    redirect('/admin')
  }

  const slug = params.slug.map(decodeURIComponent).join('/')
  const post = getAdminPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <PostEditor
      mode="edit"
      initialSlug={post.slug}
      initialPostName={post.postName}
      initialMetadata={post.metadata}
      initialContentEn={post.contentEn}
      initialContentKo={post.contentKo}
    />
  )
}
