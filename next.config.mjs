/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 배포를 위한 정적 export 설정
  // 프로덕션 빌드 시에만 활성화 (개발 서버에서는 비활성화)
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig

