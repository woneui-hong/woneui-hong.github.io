# 개발 서버 실행
npm run dev

# 서버가 시작되면 브라우저에서 http://localhost:3000 접속
# 서버를 중지하려면: Ctrl + C

# 프로덕션 빌드
npm run build

# 빌드된 파일 미리보기
npx serve out

# 실행 중인 서버 종료 (포트 3000)
# lsof -ti:3000 | xargs kill