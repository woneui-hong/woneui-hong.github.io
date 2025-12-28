import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Won Eui Hong의 블로그',
  description: 'Won Eui Hong의 블로그입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

