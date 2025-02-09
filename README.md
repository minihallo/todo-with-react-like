# React-like Todo Application

자체 구현한 React-like 라이브러리를 기반으로 만든 Todo 애플리케이션입니다. Virtual DOM, Component 시스템, Hooks API, 가상화 로직을 직접 구현했습니다.

## 주요 기능

- Todo 항목 생성, 조회, 수정, 삭제 (CRUD)
- Virtual DOM 기반 효율적인 렌더링
- React-like Hooks API (useState, useEffect 등)
- 전역 상태 관리 시스템
- 타입스크립트 기반 타입 안정성
- 가상화(Virtualization) 구현 - useWindowedList 커스텀 훅으로 대량의 Todo 항목도 효율적으로 렌더링

## 기술 스택

- TypeScript
- Express (백엔드)
- Vite (빌드 도구)
- Tailwind CSS (스타일링)
- Vitest (테스팅 도구)

## 시작하기

### 설치

```bash
npm install
```

### 백엔드 서버 실행

```bash
npx tsx server/index.ts
```

### 프론트엔드 개발 서버 실행

```bash
npm run dev
```

### 테스트

```bash
npm test
```
