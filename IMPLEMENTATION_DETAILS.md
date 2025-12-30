# 상세 구현 계획

## Phase 1: 데이터 구조 분리 (핵심)

### 1.1 새로운 파일 구조 생성

**변경 파일**: `scripts/generate-posts-json.js` → 분리
- `scripts/generate-posts-metadata.js` (신규)
- `scripts/generate-posts-content.js` (신규)
- `scripts/shared/posts-utils.js` (신규, 공통 로직)

**출력 구조**:
```
public/posts-data/
  ├── en-metadata.json
  ├── ko-metadata.json
  └── content/
      ├── en/
      │   └── {slug}.json
      └── ko/
          └── {slug}.json
```

### 1.2 메타데이터 생성 스크립트

**파일**: `scripts/generate-posts-metadata.js`

**기능**:
- 모든 포스트의 메타데이터만 추출
- `contentHtml` 제외
- 언어별로 분리된 메타데이터 JSON 생성

**출력 형식**:
```json
[
  {
    "slug": "2025/12/2025-12-29-amr-2025q3-analysis",
    "metadata": {
      "title": "...",
      "date": "...",
      "author": "...",
      "category": "...",
      "tags": [...],
      "excerpt": "..."
    }
  }
]
```

### 1.3 개별 콘텐츠 생성 스크립트

**파일**: `scripts/generate-posts-content.js`

**기능**:
- 각 포스트의 HTML 콘텐츠를 개별 파일로 저장
- slug 기반 파일명 사용
- 언어별 디렉토리 분리

**출력 형식** (`content/en/{slug}.json`):
```json
{
  "slug": "2025/12/2025-12-29-amr-2025q3-analysis",
  "contentHtml": "<div>...</div>"
}
```

### 1.4 공통 유틸리티 모듈

**파일**: `scripts/shared/posts-utils.js`

**기능**:
- `getAllPostSlugs()`: 공통 함수
- `getPostBySlug()`: 공통 함수 (메타데이터만 또는 전체)
- `processMarkdown()`: 마크다운 처리 공통 함수
- `getAllPostsMetadata()`: 메타데이터만 반환
- `getPostContent()`: HTML 콘텐츠만 반환

### 1.5 클라이언트 코드 수정

#### `src/components/PostsList.tsx`
**변경사항**:
```typescript
// 기존: /posts-data/en.json (전체 데이터)
// 변경: /posts-data/en-metadata.json (메타데이터만)
const jsonPath = `/posts-data/${language}-metadata.json`
```

**효과**: 
- 로드 시간 90% 감소
- 메모리 사용량 대폭 감소

#### `src/components/BlogPostContent.tsx`
**변경사항**:
```typescript
// 언어 변경 시: 전체 JSON 대신 개별 포스트만 로드
const jsonPath = `/posts-data/content/${language}/${slug}.json`

// 또는 빌드 타임에 이미 로드된 initialPost 사용 (변경 없음)
```

**효과**:
- 불필요한 전체 포스트 로드 제거
- 네트워크 트래픽 감소

#### `src/lib/posts.ts`
**변경사항**:
- `getAllPosts()`: 메타데이터만 반환하도록 수정 (빌드 타임)
- 런타임에서는 메타데이터 JSON 사용

### 1.6 package.json 수정

**변경사항**:
```json
{
  "scripts": {
    "prebuild": "node scripts/copy-images.js && node scripts/generate-posts-metadata.js && node scripts/generate-posts-content.js"
  }
}
```

## Phase 2: 빌드 프로세스 최적화

### 2.1 비동기 처리 전환

**변경 파일**: 
- `scripts/generate-posts-metadata.js`
- `scripts/generate-posts-content.js`
- `scripts/shared/posts-utils.js`

**변경사항**:
```javascript
// 기존
const content = fs.readFileSync(filePath, 'utf8')
const exists = fs.existsSync(filePath)

// 변경
const content = await fs.promises.readFile(filePath, 'utf8')
try {
  await fs.promises.access(filePath)
  // exists
} catch {
  // not exists
}
```

### 2.2 배치 처리 구현

**라이브러리 추가**: `p-limit` (선택사항, 또는 직접 구현)

**변경사항**:
```javascript
// 기존: 모든 포스트 동시 처리
const posts = await Promise.all(slugs.map(...))

// 변경: 배치 처리 (10개씩)
const batchSize = 10
for (let i = 0; i < slugs.length; i += batchSize) {
  const batch = slugs.slice(i, i + batchSize)
  const batchPosts = await Promise.all(batch.map(...))
  posts.push(...batchPosts)
}
```

**효과**: 메모리 사용량 안정화

### 2.3 공통 로직 통합

**파일 구조**:
```
scripts/
  ├── shared/
  │   └── posts-utils.js  # 공통 함수
  ├── generate-posts-metadata.js
  ├── generate-posts-content.js
  └── copy-images.js
```

**공통 함수**:
- `getAllPostSlugs()`
- `getPostMetadata()`: 메타데이터만 추출
- `getPostContentHtml()`: HTML만 추출
- `processMarkdown()`: 마크다운 처리

## Phase 3: 이미지 최적화

### 3.1 증분 복사 구현

**변경 파일**: `scripts/copy-images.js`

**변경사항**:
```javascript
// 파일 해시 비교
const crypto = require('crypto')
const fs = require('fs')

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(content).digest('hex')
}

// 해시 비교 후 복사
const srcHash = getFileHash(srcPath)
const destHash = getFileHash(destPath)

if (srcHash !== destHash) {
  fs.copyFileSync(srcPath, destPath)
}
```

**효과**: 변경된 이미지만 복사

## Phase 4: 증분 빌드 (선택사항)

### 4.1 캐시 메커니즘

**파일**: `scripts/.build-cache.json`

**구조**:
```json
{
  "posts": {
    "2025/12/2025-12-29-amr-2025q3-analysis": {
      "en": {
        "mtime": 1234567890,
        "hash": "abc123"
      },
      "ko": {
        "mtime": 1234567890,
        "hash": "def456"
      }
    }
  },
  "images": {
    "2025/12/2025-12-29-amr-2025q3-analysis/res/images/img1.png": {
      "mtime": 1234567890,
      "hash": "xyz789"
    }
  }
}
```

**로직**:
1. 빌드 시작 시 캐시 로드
2. 파일 수정 시간 비교
3. 변경된 파일만 재처리
4. 빌드 완료 시 캐시 업데이트

## 마이그레이션 전략

### 단계별 전환

1. **Phase 1 구현**
   - 새로운 스크립트 작성
   - 새로운 JSON 구조 생성
   - 클라이언트 코드 수정

2. **하위 호환성 유지**
   ```typescript
   // PostsList.tsx
   const jsonPath = `/posts-data/${language}-metadata.json`
   
   // Fallback to old format
   fetch(jsonPath)
     .catch(() => fetch(`/posts-data/${language}.json`))
   ```

3. **테스트**
   - 로컬 빌드 테스트
   - 언어 전환 테스트
   - 포스트 목록/상세 테스트

4. **배포**
   - 새로운 구조로 빌드
   - 기존 JSON 파일 제거 (선택사항)

## 예상 코드 변경량

### Phase 1
- 신규 파일: 3개
- 수정 파일: 3개
- 코드 라인: ~400줄 (신규), ~100줄 (수정)

### Phase 2
- 수정 파일: 3개
- 코드 라인: ~150줄 (수정)

### Phase 3
- 수정 파일: 1개
- 코드 라인: ~50줄 (수정)

## 테스트 체크리스트

### 기능 테스트
- [ ] 포스트 목록 표시 (en/ko)
- [ ] 포스트 상세 페이지 표시 (en/ko)
- [ ] 언어 전환 (목록 페이지)
- [ ] 언어 전환 (상세 페이지)
- [ ] 이미지 표시
- [ ] 메타데이터 표시 (제목, 날짜, 태그 등)

### 성능 테스트
- [ ] 빌드 시간 측정
- [ ] 목록 페이지 로딩 시간
- [ ] 상세 페이지 로딩 시간
- [ ] 네트워크 요청 크기 확인
- [ ] 메모리 사용량 확인

### 엣지 케이스
- [ ] 포스트가 없는 경우
- [ ] 한 언어만 있는 포스트
- [ ] 큰 이미지 파일
- [ ] 긴 포스트 콘텐츠

