import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export const metadata = {
  title: 'Admin Login - Won Eui Hong',
  robots: 'noindex, nofollow',
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  )
}
