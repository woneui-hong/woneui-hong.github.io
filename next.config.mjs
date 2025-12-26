/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export'는 프로덕션 빌드 시에만 필요합니다
  // 개발 모드(npm run dev)에서는 이 설정을 주석 처리해야 합니다
  // 빌드 시에는 주석을 해제하세요: npm run build
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig

