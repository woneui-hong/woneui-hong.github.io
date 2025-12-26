# 블로그 포스트 작성 가이드

이 폴더(`content/posts/`)는 전문가로서 블로그 컨텐츠를 작성하는 전용 공간입니다.

## 폴더 구조

블로그 포스트는 **연도/월** 폴더 구조로 정리됩니다:

```
content/posts/
├── README.md (이 파일)
├── _template.md (포스트 템플릿)
├── 2024/
│   ├── 01/
│   │   ├── 2024-01-15-work-prioritization-before-automation.md
│   │   └── 2024-01-20-data-analysis-tips.md
│   ├── 02/
│   │   └── 2024-02-10-python-automation-guide.md
│   └── ...
├── 2025/
│   ├── 01/
│   │   └── 2025-01-05-new-year-automation-trends.md
│   └── ...
└── ...
```

## 사용 방법

1. **폴더 생성**: 새로운 포스트를 작성할 때, 해당 연도와 월의 폴더가 없으면 먼저 생성하세요.
   - 예: 2024년 1월 포스트 → `content/posts/2024/01/` 폴더에 작성

2. **파일 생성**: 해당 월 폴더에 마크다운 파일(`.md`)을 생성하세요.
   - 파일명은 날짜와 제목을 포함하는 것을 권장합니다.
   - 예: `2024-01-15-business-automation-guide.md`

3. **Frontmatter 작성**: 각 포스트는 frontmatter를 포함해야 합니다.
   - `_template.md` 파일을 참고하세요.

## 폴더 생성 예시

```bash
# 2024년 1월 포스트 작성 시
mkdir -p content/posts/2024/01

# 2024년 2월 포스트 작성 시
mkdir -p content/posts/2024/02

# 2025년 1월 포스트 작성 시
mkdir -p content/posts/2025/01
```

## URL 구조

포스트의 URL은 폴더 구조를 반영합니다:
- `content/posts/2024/01/post-name.md` → `/blog/2024/01/post-name`
- `content/posts/2025/02/another-post.md` → `/blog/2025/02/another-post`

## 장점

- **정리**: 연도/월별로 자동 정리되어 관리가 쉬움
- **확장성**: 많은 포스트를 작성해도 구조가 깔끔하게 유지됨
- **직관성**: 파일 위치만 봐도 작성 시기를 알 수 있음

