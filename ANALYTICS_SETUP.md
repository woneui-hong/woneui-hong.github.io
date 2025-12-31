# Google Analytics 설정 가이드

이 블로그는 Google Analytics 4 (GA4)를 사용하여 방문자 수와 포스팅당 조회수를 추적합니다.

## 설정 방법

### 1. Google Analytics 계정 생성

1. [Google Analytics](https://analytics.google.com/)에 접속
2. 계정 생성 (무료)
3. 속성(Property) 생성
4. 데이터 스트림에서 웹 스트림 추가
5. **측정 ID(Measurement ID)** 복사 (형식: `G-XXXXXXXXXX`)

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**주의**: `G-XXXXXXXXXX`를 실제 측정 ID로 교체하세요.

### 3. 로컬 개발 환경

```bash
npm run dev
```

환경 변수가 설정되면 자동으로 Google Analytics가 활성화됩니다.

### 4. 프로덕션 배포 (GitHub Pages)

GitHub Actions를 사용하여 배포하는 경우, GitHub 저장소의 Secrets에 환경 변수를 추가해야 합니다:

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** 클릭
4. Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
5. Value: 실제 측정 ID (예: `G-XXXXXXXXXX`)
6. **Add secret** 클릭

그리고 `.github/workflows/deploy.yml` 파일에 환경 변수를 추가해야 합니다:

```yaml
- name: Build Next.js
  run: npm run build
  env:
    NODE_ENV: production
    NEXT_PUBLIC_GA_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_GA_MEASUREMENT_ID }}
```

## 추적되는 데이터

- **전체 방문자 수**: Google Analytics 대시보드에서 확인 가능
- **페이지뷰**: 각 포스트 페이지 방문 시 자동 추적
- **사용자 행동**: 페이지 이동, 체류 시간 등

## 데이터 확인

1. [Google Analytics](https://analytics.google.com/)에 로그인
2. 대시보드에서 실시간 및 과거 데이터 확인
3. **보고서** → **참여도** → **페이지 및 화면**에서 포스팅별 조회수 확인

## 비활성화

Google Analytics를 비활성화하려면:

1. `.env.local` 파일에서 `NEXT_PUBLIC_GA_MEASUREMENT_ID`를 제거하거나 빈 값으로 설정
2. 또는 `src/components/GoogleAnalytics.tsx`에서 `GA_MEASUREMENT_ID`를 빈 문자열로 설정

## 프라이버시

Google Analytics는 쿠키를 사용하여 사용자를 추적합니다. GDPR 등 프라이버시 규정을 준수하려면 쿠키 동의 배너를 추가하는 것을 고려하세요.

## 대안 서비스

Google Analytics 외에도 다음 무료 서비스를 사용할 수 있습니다:

- **Cloudflare Web Analytics**: 프라이버시 중심, 설정 간단
- **Umami**: 오픈소스, self-hosted 가능

다른 서비스로 변경하려면 `src/components/GoogleAnalytics.tsx`를 수정하거나 새로운 컴포넌트를 생성하세요.

