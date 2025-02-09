import express from "express";
import cors from "cors";
import compression from "compression";

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
app.get("/todos", (req, res) => {
  console.log(req);
  res.json(todos);
});

/**
 * [POST] /todos
 * - 새로운 TODO 항목을 추가
 * @param {string} content - TODO 내용
 * @param {number | null} parentId - 부모 TODO의 ID (없으면 null)
 */
app.post("/todos", (req, res) => {
  const { content, parentId } = req.body;

  const newId = todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
  const newTodo: TodoItem = {
    id: newId,
    content,
    parentId: parentId ?? null,
    completed: false,
  };

  todos.push(newTodo);

  todoIndexMap.set(newTodo.id, todos.length - 1);

  if (newTodo.parentId !== null) {
    const children = parentChildMap.get(newTodo.parentId) || [];
    children.push(newTodo.id);
    parentChildMap.set(newTodo.parentId, children);
  }

  res.status(201).json(newTodo);
});

const todoIndexMap = new Map(todos.map((todo, index) => [todo.id, index]));
const parentChildMap = new Map<number, number[]>();

todos.forEach((todo) => {
  if (todo.parentId !== null) {
    const children = parentChildMap.get(todo.parentId) || [];
    children.push(todo.id);
    parentChildMap.set(todo.parentId, children);
  }
});

/**
 * 특정 TODO의 모든 하위 항목 ID를 반환
 * @param {number} todoId - 상위 TODO의 ID
 * @returns {number[]} 모든 하위 항목의 ID 배열
 */
const getAllChildrenIds = (todoId: number): number[] => {
  const result: number[] = [];
  const stack = [todoId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const children = parentChildMap.get(currentId) || [];
    result.push(...children);
    stack.push(...children);
  }

  return result;
};

/**
 * 여러 TODO 항목을 일괄 업데이트
 * @param {number[]} todoIds - 업데이트할 TODO ID 배열
 * @param {Partial<TodoItem>} updates - 업데이트할 필드와 값
 * @returns {TodoItem[]} 업데이트된 TODO 항목 배열
 */
const batchUpdateTodos = (todoIds: number[], updates: Partial<(typeof todos)[number]>) => {
  return todoIds
    .map((todoId) => {
      const index = todoIndexMap.get(todoId);
      if (index === undefined) return null;

      const { content, completed, parentId } = updates;
      const updatedFields: Partial<(typeof todos)[number]> = { id: todoId };

      if (typeof content === "string") {
        todos[index].content = content;
        updatedFields.content = content;
      }
      if (typeof completed === "boolean") {
        todos[index].completed = completed;
        updatedFields.completed = completed;
      }
      if (typeof parentId === "number" || parentId === null) {
        todos[index].parentId = parentId;
        updatedFields.parentId = parentId;
      }

      return updatedFields;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * [PATCH] /todos/:id
 * - TODO 항목 업데이트
 * @param {boolean} updateChildren - 하위 항목도 함께 업데이트할지 여부
 */
app.patch("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const { updateChildren = false, ...updates } = req.body;

  const index = todoIndexMap.get(todoId);
  if (index === undefined) {
    res.status(404).json({ error: "Todo not found." });
  }

  const todoIds = [todoId];
  if (updateChildren && "completed" in updates) {
    todoIds.push(...getAllChildrenIds(todoId));
  }

  const updatedItems = batchUpdateTodos(todoIds, updates);
  res.json(updatedItems);
});

/**
 * 여러 TODO 항목을 일괄 삭제
 * @param {number[]} todoIds - 삭제할 TODO ID 배열
 * @returns {TodoItem[]} 삭제된 TODO 항목 배열
 */
const batchDeleteTodos = (todoIds: number[]) => {
  const indexesToDelete = todoIds
    .map((id) => todoIndexMap.get(id))
    .filter((index): index is number => index !== undefined)
    .sort((a, b) => b - a);

  const deletedItems = indexesToDelete.map((index) => {
    const deletedTodo = todos[index];
    todoIndexMap.delete(deletedTodo.id);
    parentChildMap.delete(deletedTodo.id);
    if (deletedTodo.parentId !== null) {
      const parentChildren = parentChildMap.get(deletedTodo.parentId);
      if (parentChildren) {
        const updatedChildren = parentChildren.filter(id => id !== deletedTodo.id);
        if (updatedChildren.length > 0) {
          parentChildMap.set(deletedTodo.parentId, updatedChildren);
        } else {
          parentChildMap.delete(deletedTodo.parentId);
        }
      }
    }
    return deletedTodo;
  });

  indexesToDelete.forEach((index) => {
    todos.splice(index, 1);
  });

  todos.forEach((todo, index) => {
    todoIndexMap.set(todo.id, index);
  });

  return deletedItems;
};

/**
 * [DELETE] /todos/:id
 * - TODO 항목 삭제 (하위 항목도 함께 삭제)
 */
app.delete("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const index = todoIndexMap.get(todoId);

  if (index === undefined) {
    res.status(404).json({ error: "Todo not found." });
  }

  const idsToDelete = [todoId, ...getAllChildrenIds(todoId)];
  const deletedItems = batchDeleteTodos(idsToDelete);

  res.json(deletedItems);
});

// -----------------------------------------------------
// 4) 서버 실행
// -----------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
