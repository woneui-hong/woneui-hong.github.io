'use client'

import { useState, useEffect, useCallback, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Upload,
  Link2,
  Video,
  Rocket,
  Trash2,
} from 'lucide-react'

interface PostMetadata {
  title: string
  date: string
  time?: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  featured?: boolean
  published?: boolean
  series?: string
  part?: number
}

interface PostEditorProps {
  mode: 'create' | 'edit'
  initialSlug?: string
  initialPostName?: string
  initialMetadata?: Partial<PostMetadata>
  initialContentEn?: string
  initialContentKo?: string
}

const defaultMetadata: PostMetadata = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  author: 'Won Eui Hong',
  category: 'Blog',
  tags: [],
  excerpt: '',
  featured: false,
  published: true,
}

export default function PostEditor({
  mode,
  initialSlug = '',
  initialPostName = '',
  initialMetadata = {},
  initialContentEn = '',
  initialContentKo = '',
}: PostEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const [postName, setPostName] = useState(initialPostName)
  const [metadata, setMetadata] = useState<PostMetadata>({
    ...defaultMetadata,
    ...initialMetadata,
    tags: initialMetadata.tags || [],
  })
  const [contentEn, setContentEn] = useState(initialContentEn)
  const [contentKo, setContentKo] = useState(initialContentKo)
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [slug, setSlug] = useState(initialSlug)

  const currentContent = lang === 'en' ? contentEn : contentKo
  const setCurrentContent = lang === 'en' ? setContentEn : setContentKo

  const updatePreview = useCallback(async (content: string) => {
    try {
      const res = await fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, slug: slug || 'preview' }),
      })
      if (res.ok) {
        const data = await res.json()
        setPreviewHtml(data.html)
      }
    } catch {
      setPreviewHtml('<p class="text-gray-400">Preview unavailable</p>')
    }
  }, [slug])

  useEffect(() => {
    const timer = setTimeout(() => updatePreview(currentContent), 400)
    return () => clearTimeout(timer)
  }, [currentContent, updatePreview])

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      setCurrentContent((prev) => prev + '\n' + text)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = currentContent.slice(0, start)
    const after = currentContent.slice(end)
    const newContent = before + text + after
    setCurrentContent(newContent)
    setTimeout(() => {
      textarea.focus()
      const pos = start + text.length
      textarea.setSelectionRange(pos, pos)
    }, 0)
  }

  async function handleInsertLinkPreview() {
    const url = prompt('Enter URL for link preview:')
    if (!url) return
    try {
      new URL(url)
    } catch {
      alert('Invalid URL')
      return
    }
    insertAtCursor(`\n[preview](${url})\n`)
  }

  function handleInsertVideo() {
    const url = prompt('Enter YouTube or Vimeo URL:')
    if (!url) return
    insertAtCursor(`\n[video](${url})\n`)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const currentSlug = slug || buildPreviewSlug()
    const formData = new FormData()
    formData.append('slug', currentSlug)
    formData.append('file', file)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      insertAtCursor(`\n${data.markdown}\n`)
      if (!slug) setSlug(currentSlug)
    } else {
      alert('Image upload failed')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function buildPreviewSlug(): string {
    const dateParts = metadata.date.split('-')
    const year = dateParts[0]
    const month = dateParts[1]
    const name = postName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
    return `${year}/${month}/${name}`
  }

  async function handleSave(e?: FormEvent) {
    e?.preventDefault()
    if (!postName.trim()) {
      alert('Post slug/name is required')
      return
    }
    if (!metadata.title.trim()) {
      alert('Title is required')
      return
    }

    setSaving(true)
    setMessage('')

    const payload = {
      slug: mode === 'edit' ? slug : undefined,
      postName: postName.trim(),
      date: metadata.date,
      metadata: {
        ...metadata,
        tags: typeof metadata.tags === 'string'
          ? (metadata.tags as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
          : metadata.tags,
      },
      contentEn,
      contentKo,
    }

    const url = mode === 'edit'
      ? `/api/admin/posts/${slug.split('/').map(encodeURIComponent).join('/')}`
      : '/api/admin/posts'

    const res = await fetch(url, {
      method: mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (res.ok) {
      const data = await res.json()
      setSlug(data.slug)
      setMessage('Saved successfully')
      if (mode === 'create') {
        router.push(`/admin/posts/${data.slug.split('/').map(encodeURIComponent).join('/')}/edit`)
      }
    } else {
      setMessage('Failed to save post')
    }
  }

  async function handlePublish() {
    if (!confirm('Commit and push all changes to GitHub? This will deploy to woneui-hong.github.io.')) {
      return
    }
    setPublishing(true)
    setMessage('')
    const res = await fetch('/api/admin/publish', { method: 'POST' })
    setPublishing(false)
    if (res.ok) {
      setMessage('Published to GitHub')
    } else {
      const data = await res.json()
      setMessage(data.error || 'Publish failed')
    }
  }

  async function handleDelete() {
    if (!slug || !confirm('Delete this post permanently?')) return
    const res = await fetch(
      `/api/admin/posts/${slug.split('/').map(encodeURIComponent).join('/')}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      alert('Failed to delete post')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              <Rocket size={14} />
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {message && (
          <p className="mb-4 text-sm text-center text-gray-600">{message}</p>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Post slug</label>
              <input
                type="text"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100"
                placeholder="my-first-post"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
              <input
                type="time"
                value={metadata.time || ''}
                onChange={(e) => setMetadata({ ...metadata, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : ''}
                onChange={(e) => setMetadata({
                  ...metadata,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={metadata.excerpt}
                onChange={(e) => setMetadata({ ...metadata, excerpt: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-6 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={metadata.featured ?? false}
                  onChange={(e) => setMetadata({ ...metadata, featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={metadata.published !== false}
                  onChange={(e) => setMetadata({ ...metadata, published: e.target.checked })}
                />
                Published
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${lang === 'en' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ko')}
                  className={`px-3 py-1.5 text-sm rounded-lg ${lang === 'ko' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Korean
                </button>
              </div>
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Upload image"
                >
                  <Upload size={14} />
                  Image
                </button>
                <button
                  type="button"
                  onClick={handleInsertLinkPreview}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Insert link preview"
                >
                  <Link2 size={14} />
                  Link preview
                </button>
                <button
                  type="button"
                  onClick={handleInsertVideo}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Insert video link"
                >
                  <Video size={14} />
                  Video
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-0">
                <textarea
                  ref={textareaRef}
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  className="w-full h-[500px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-0 resize-none"
                  placeholder="Write your post in Markdown…"
                />
              </div>
              <div className="p-4 h-[500px] overflow-y-auto">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Preview</p>
                <div
                  className="prose prose-sm max-w-none post-content"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
