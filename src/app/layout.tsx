import type { Metadata } from 'next'
import '../../styles/globals.css'

export const metadata: Metadata = {
  title: 'InsightFlow - Work Prioritization Before Automation',
  description: 'WP (Work Prioritization) comes before DX or AX. Automating inefficient processes only accelerates inefficiency.',
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

