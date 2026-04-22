# woneui-hong.github.io

Next.js 블로그 (GitHub Pages 정적 배포). 포스트는 `content/posts`의 Markdown만 추가·수정하면 되고, 빌드 시 `public/posts-data`가 자동 생성됩니다.

## 디렉터리 구조 (요약)

```
.
├── config/                 Next, PostCSS, TypeScript, Tailwind, ESLint 본문
├── content/posts/         블로그 Markdown 원본
├── docs/                  이 문서, GA 설정 안내
├── public/                정적 파일, 빌드 시 생성되는 posts-data
├── scripts/               빌드·배포 스크립트
├── src/                   Next.js 앱 (app, components, lib)
├── .github/workflows/     GitHub Pages 배포
├── next.config.mjs        → config/next.config.mjs re-export
├── postcss.config.js      → config/postcss.config.js re-export
├── tsconfig.json          → config/tsconfig.json extends
├── package.json
└── README.md              GitHub용 짧은 안내 → 이 문서
```

## 로컬 실행

```bash
npm install
npm run dev
```

프로덕션과 동일하게 보려면 `npm run build` 후 `npx serve out` (또는 `npm start`는 `next start`용).

## 포스팅

1. `content/posts/` 아래에 기존 구조(연/월/글-slug/en|ko/…)에 맞춰 `.md` 파일을 둡니다.  
2. 글 안의 이미지는 포스트 폴더 규칙에 맞게 두면 빌드 시 `public/posts`로 복사됩니다.  
3. 배포 전 `npm run build`로 `public/posts-data/*.json`이 갱신되는지 확인합니다.

## 배포

`main` 브랜치 push 시 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)이 `out/`을 GitHub Pages에 올립니다. 수동 배포는 `npm run deploy`(로컬 git add/commit/push 스크립트)를 사용할 수 있습니다.

## Google Analytics

선택 사항. `NEXT_PUBLIC_GA_MEASUREMENT_ID` 환경 변수와 [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)를 참고하세요.

## 레이아웃

- `src/app` — 페이지·라우트  
- `src/components` — UI  
- `config/` — Next/PostCSS/TS/ Tailwind/ESLint 설정 (루트는 도구가 찾는 래퍼만 둠)  
- `next-env.d.ts` — Next/TypeScript 연동(빌드·개발 시 갱신 가능; **커밋**해 두는 것이 일반적)  
- `scripts/build-posts-data.js` — 이미지 복사 + `public/posts-data` 생성  
- `scripts/shared/posts-utils.js` — 빌드 시 Markdown 파싱 (런타임은 `src/lib/posts.ts`와 역할이 겹치나, 빌드 스크립트는 Node에서 동일 파이프라인을 씁니다)
