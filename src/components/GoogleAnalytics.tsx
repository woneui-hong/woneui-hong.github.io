'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Google Analytics 측정 ID
// 방법 1: 환경 변수 사용 (로컬: .env.local, 프로덕션: GitHub Secrets)
// 방법 2: 아래에 직접 측정 ID를 입력 (더 간단하지만 코드에 노출됨)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '' // 또는 직접 입력: 'G-XXXXXXXXXX'

export default function GoogleAnalytics() {
  const pathname = usePathname()

  // pathname 변경 시 페이지뷰 추적
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
      return
    }

    // gtag 함수가 로드되었는지 확인
    if ((window as any).gtag) {
      const url = window.location.pathname + window.location.search
      ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }, [pathname])

  // GA_MEASUREMENT_ID가 없으면 아무것도 렌더링하지 않음
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics 스크립트 */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

