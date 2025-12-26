/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 빌드 시에만 정적 export 활성화
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig

