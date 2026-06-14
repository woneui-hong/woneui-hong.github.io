/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async rewrites() {
    if (process.env.NODE_ENV !== 'production') {
      const adminPort = process.env.ADMIN_API_PORT || '3008'
      return [
        {
          source: '/api/admin/:path*',
          destination: `http://127.0.0.1:${adminPort}/api/admin/:path*`,
        },
      ]
    }
    return []
  },
}

export default nextConfig
