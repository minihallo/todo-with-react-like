# 프로젝트 개요 및 기본 정보.

서버 실행 방법 : npx tsx server/index.ts
앱 실행 방법 : npm run dev

# 모든 테스트 실행
npm test

# 테스트를 감시 모드로 실행 (파일 변경시 자동 재실행)
npm run test:watch

# 커버리지 리포트와 함께 테스트 실행
npm run test:coverage

# treeUtils.test.ts 파일만 테스트
npm test tests/unit/utils/treeUtils.test.ts

# 파일명에 tree가 포함된 모든 테스트 실행
npm test tree