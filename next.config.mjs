/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 배포를 위한 정적 export 설정
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig

