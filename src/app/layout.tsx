import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Won Eui Hong',
  description: 'Won Eui Hong\'s Blog',
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

