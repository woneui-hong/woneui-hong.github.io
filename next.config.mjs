/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes를 사용하기 위해 정적 export 비활성화
  // 이미지는 content 폴더에서 API route를 통해 동적으로 제공됨
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig

