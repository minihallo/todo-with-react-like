## 전체 아키텍처
```
[root project]
    │
    ├── public
    ├── server
    │     └── index.ts
    ├── src
    │     ├── lib
    │     │     ├── component/              # 컴포넌트 시스템
    │     │     │     ├── instance.ts       # 컴포넌트 인스턴스 생성 및 라이프사이클 관리
    │     │     │     └── types.ts          # 컴포넌트 관련 타입 정의
    │     │     ├── vdom/                   # Virtual DOM 시스템
    │     │     │     ├── createElement.ts  # JSX로부터 가상 DOM 노드 생성
    │     │     │     ├── reconciler.ts     # 가상 DOM diff 및 실제 DOM 업데이트
    │     │     │     └── types.ts          # VDOM 관련 타입 정의
    │     │     ├── globalState.ts          # 전역 상태 관리 시스템
    │     │     ├── hooks.ts                # React-like Hooks 구현 (useState, useEffect 등)
    │     │     ├── index.ts                # 라이브러리 진입점 및 주요 API 노출
    │     │     └── jsx.d.ts                # JSX 타입 정의
    │     ├── hooks
    │     │     └── useWindowedList.ts
    │     ├── utils
    │     │     └── treeUtils.ts
    │     ├── components
    │     │     ├── TodoForm.tsx
    │     │     ├── TodoItem.tsx
    │     │     └── TodoList.tsx
    │     │
    │     ├── App.tsx
    │     ├── api.tsx
    │     ├── index.css
    │     ├── main.tsx
    │     └── types.ts
    │
    ├── ARCHITECTURE_DIAGRAM.md
    ├── ISSUE_IMPROVEMENTS.md
    ├── README.md
    ├── USE_AI.md
    │
    ├── package.json
    │
    └── etc setting files (vite, tailwind, postcss, ts ...)
```

1. React-like 라이브러리의 주요 구성 요소와 그 역할

## Component 시스템
instance.ts: 컴포넌트의 생성, 마운트, 업데이트, 언마운트 등 생명주기 관리
컴포넌트 상태 관리 및 렌더링 로직 처리

## Virtual DOM 시스템
createElement.ts: JSX를 가상 DOM 객체로 변환
reconciler.ts: 이전/현재 가상 DOM을 비교하고 실제 DOM 업데이트 수행
효율적인 DOM 업데이트를 위한 diff 알고리즘 구현

## 상태 관리 및 Hooks
globalState.ts: 애플리케이션 전역 상태 관리
hooks.ts: useState, useEffect, useMemo, useGlobalState Hooks 시스템 구현

## 타입 시스템
jsx.d.ts: TypeScript에서 JSX 문법 사용을 위한 타입 정의
각 모듈의 types.ts: 해당 모듈에서 사용되는 타입들을 정의



2. Client <-> Server 데이터 흐름

[Client Side]
    │
    ├── Components
    │     ├── TodoForm: POST /api/todos       # 새 Todo 생성
    │     ├── TodoList: GET /api/todos        # Todo 목록 조회
    │     └── TodoItem    
    │           ├── PATCH  /api/todos/:id     # Todo 수정
    │           └── DELETE /api/todos/:id     # Todo 삭제
    │
    ├── api.ts                                # API 요청 처리 모듈
    │     ├── addTodo()       -> POST
    │     ├── fetchTodos()    -> GET
    │     ├── updateTodo()    -> PATCH
    │     └── deleteTodo()    -> DELETE
    │
    └── 데이터 흐름
          1. 사용자 액션 (입력/수정/삭제)
          2. API 함수 호출
          3. 서버 응답 대기
          4. 상태 업데이트
          5. 컴포넌트 리렌더링

[Server Side: /server/index.ts]
    │
    └── API Endpoints
          ├── POST   /api/todos      # Todo 생성
          ├── GET    /api/todos      # Todo 목록 조회
          ├── PATCH  /api/todos/:id  # Todo 수정
          └── DELETE /api/todos/:id  # Todo 삭제



3. 데이터 상태 관리와 렌더링 흐름
│
├── [상태 변경 트리거]
│     ├── 1. 사용자 인터랙션 (TodoForm에서 새 Todo 추가)
│     ├── 2. 서버 응답 (TodoList가 새로운 데이터 수신)
│     └── 3. 시스템 이벤트 (windowSize 변경)
│
├── [상태 업데이트 과정]
│     ├── globalState.ts
│     │     └── 전역 상태 저장소에서 상태 업데이트
│     │
│     ├── hooks.ts
│     │     ├── useState: 컴포넌트 로컬 상태 관리
│     │     └── useEffect: 부수 효과 처리 (API 호출 등)
│     │
│     └── instance.ts
│           └── 컴포넌트 인스턴스의 상태 업데이트 처리
│
└── [렌더링 파이프라인]
     ├── 1. 상태 변경 감지
     ├── 2. 컴포넌트 렌더 함수 호출
     ├── 3. Virtual DOM 트리 생성
     ├── 4. Diff 알고리즘으로 변경 감지
     └── 5. 실제 DOM 업데이트


