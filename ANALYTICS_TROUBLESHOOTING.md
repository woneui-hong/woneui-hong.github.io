# Google Analytics 문제 해결 가이드

## "Data collection isn't active" 경고가 나타나는 경우

이 경고는 Google Analytics가 실제로 데이터를 수집하지 못하고 있다는 의미입니다. 다음을 확인하세요.

## 확인 체크리스트

### 1. 환경 변수 설정 확인

#### 로컬 개발 환경
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일 내용에 `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`가 있는지 확인
- 측정 ID가 올바른지 확인 (G-로 시작)

#### 프로덕션 환경 (GitHub Pages)
- GitHub 저장소의 Secrets에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 설정되어 있는지 확인
- 최근에 배포를 실행했는지 확인 (환경 변수 변경 후 재배포 필요)

### 2. 배포된 사이트에서 스크립트 확인

1. `woneui-hong.github.io` 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭에서 다음 명령어 실행:
   ```javascript
   window.dataLayer
   ```
   - 결과가 `undefined`이면 스크립트가 로드되지 않은 것
   - 배열이 반환되면 정상 작동 중

4. **Network** 탭에서 `gtag` 또는 `googletagmanager` 검색
   - `gtag/js?id=G-XXXXXXXXXX` 요청이 보여야 함

5. **Elements** 탭에서 페이지 소스 검색 (Ctrl+F / Cmd+F)
   - `gtag` 또는 `googletagmanager` 검색
   - 스크립트 태그가 있어야 함

### 3. Google Analytics 실시간 확인

1. [Google Analytics](https://analytics.google.com/) 접속
2. **보고서** → **실시간** 메뉴로 이동
3. 별도 창에서 `woneui-hong.github.io` 접속
4. 실시간 보고서에서 방문자 수가 증가하는지 확인
   - 몇 초 내에 반영되어야 함

### 4. 측정 ID 확인

Google Analytics에서 측정 ID가 올바른지 확인:
1. Google Analytics → **관리** (톱니바퀴 아이콘)
2. **속성** → **데이터 스트림**
3. 웹 스트림 클릭
4. **측정 ID** 확인 (G-XXXXXXXXXX 형식)

## 일반적인 문제와 해결 방법

### 문제 1: 환경 변수가 설정되지 않음

**증상**: 스크립트가 전혀 로드되지 않음

**해결**:
- 로컬: `.env.local` 파일 생성 및 측정 ID 입력
- 프로덕션: GitHub Secrets 설정 후 재배포

### 문제 2: 환경 변수는 설정했지만 배포되지 않음

**증상**: 로컬에서는 작동하지만 프로덕션에서는 작동하지 않음

**해결**:
1. GitHub Secrets 확인
2. `.github/workflows/deploy.yml`에 환경 변수가 포함되어 있는지 확인
3. 코드를 push하여 재배포

### 문제 3: 측정 ID가 잘못됨

**증상**: 스크립트는 로드되지만 데이터가 수집되지 않음

**해결**:
- Google Analytics에서 측정 ID 재확인
- 환경 변수에 올바른 측정 ID 입력

### 문제 4: 아직 48시간이 지나지 않음

**증상**: 설정은 올바르지만 경고가 계속 나타남

**해결**:
- Google Analytics는 최대 48시간까지 데이터 수집을 확인하는 데 걸릴 수 있음
- 실시간 보고서에서 데이터가 들어오는지 확인하면 정상 작동 중인 것

## 빠른 진단 스크립트

배포된 사이트의 Console에서 다음을 실행하여 상태 확인:

```javascript
// 1. dataLayer 확인
console.log('dataLayer:', window.dataLayer);

// 2. gtag 함수 확인
console.log('gtag function:', typeof window.gtag);

// 3. 측정 ID 확인 (스크립트 태그에서)
const scripts = document.querySelectorAll('script');
scripts.forEach(script => {
  if (script.src.includes('googletagmanager.com')) {
    console.log('GA Script found:', script.src);
  }
  if (script.innerHTML.includes('gtag')) {
    console.log('GA Config found:', script.innerHTML);
  }
});
```

## 여전히 작동하지 않는 경우

1. **브라우저 확장 프로그램 확인**: 광고 차단기나 프라이버시 확장 프로그램이 GA 스크립트를 차단할 수 있음
2. **캐시 클리어**: 브라우저 캐시를 지우고 다시 시도
3. **시크릿 모드 테스트**: 시크릿/프라이빗 모드에서 테스트
4. **다른 브라우저/기기에서 테스트**: 특정 브라우저 문제일 수 있음

## 정상 작동 확인 방법

다음 중 하나라도 확인되면 정상 작동 중입니다:
- ✅ 실시간 보고서에서 방문자 수가 증가함
- ✅ Console에서 `window.dataLayer`가 배열을 반환함
- ✅ Network 탭에서 `gtag/js` 요청이 보임
- ✅ 페이지 소스에 Google Analytics 스크립트가 포함됨

이 경우 "Data collection isn't active" 경고는 무시해도 됩니다. Google Analytics가 데이터를 수집하고 있지만, 경고가 사라지는 데 시간이 걸릴 수 있습니다.

