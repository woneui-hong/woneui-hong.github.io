# Google Analytics (선택)

GA4 측정 ID만 넣으면 됩니다.

## 로컬

프로젝트 루트에 `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## GitHub Actions

저장소 **Settings → Secrets and variables → Actions**에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`를 추가합니다.  
배포 워크플로([`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml))가 이미 빌드 시 이 값을 넘기도록 되어 있습니다.

## 끄기

`NEXT_PUBLIC_GA_MEASUREMENT_ID`를 비우거나 변수를 제거하면 스크립트를 로드하지 않습니다.
