import express from 'express';
import cors from 'cors';
import compression from 'compression';

interface TodoItem {
  id: number;
  content: string;
  parentId: number | null;
  completed: boolean;
}

let todos: TodoItem[] = [];

// -----------------------------------------------------
// 1) Express 앱 생성 & 미들웨어 설정
// -----------------------------------------------------
const app = express();
app.use(cors());
app.use(compression());
app.use(express.json());
// -----------------------------------------------------
// 2) 대량의 TODO 데이터 준비 (임시 인메모리 데이터)
// -----------------------------------------------------
const generateTodos = (count: number): TodoItem[] => {
  const todoList: TodoItem[] = [];
  for (let i = 1; i <= count; i++) {
    const parentId = i <= 10 ? null : Math.floor(i / 10);
    
    todoList.push({
      id: i,
      content: `Task ${i}`,
      parentId,
      completed: false,
    });
  }
  return todoList;
};

todos = generateTodos(100000);

// -----------------------------------------------------
// 3) API 라우트 구현
// -----------------------------------------------------

/**
 * [GET] /todos
 * - TODO 리스트를 반환 (flat list)
 */
app.get('/todos', (req, res) => {
  console.log(req);
  res.json(todos);
});

/**
 * [POST] /todos
 * - 새로운 TODO 항목을 추가
 */
app.post('/todos', (req, res) => {
  const { content, parentId } = req.body;

  const newId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  const newTodo: TodoItem = {
    id: newId,
    content,
    parentId: parentId ?? null,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

/**
 * [PATCH] /todos/:id
 * - 특정 TODO 항목 일부 업데이트
 * - body에 포함된 필드만 변경 (예: completed)
 */
app.patch('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const { content, completed, parentId } = req.body;

  const index = todos.findIndex(todo => todo.id === todoId);
  if (index === -1) {
    res.status(404).json({ error: 'Todo not found.' });
  }

  const updatedFields: Partial<typeof todos[number]> = { id: todoId };

  if (typeof content === 'string') {
    todos[index].content = content;
    updatedFields.content = content;
  }
  if (typeof completed === 'boolean') {
    todos[index].completed = completed;
    updatedFields.completed = completed;
  }
  if (typeof parentId === 'number' || parentId === null) {
    todos[index].parentId = parentId;
    updatedFields.parentId = parentId;
  }

  res.json(updatedFields);
});

/**
 * [DELETE] /todos/:id
 * - 특정 TODO 항목 삭제
 */
app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const index = todos.findIndex(todo => todo.id === todoId);
  if (index === -1) {
    res.status(404).json({ error: 'Todo not found.' });
  }

  const deleted = todos.splice(index, 1)[0];
  res.json(deleted);
});

// -----------------------------------------------------
// 4) 서버 실행
// -----------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
