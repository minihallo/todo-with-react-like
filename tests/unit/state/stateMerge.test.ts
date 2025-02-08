import { describe, it, expect, beforeEach } from "vitest";

describe("Todo 상태 병합 테스트", () => {
  let todos: { id: number; content: string; completed: boolean }[];
  let idToIndex: Map<number, number>;
  let updateTodo: (todoId: number, updatedFields: Partial<typeof todos[0]>) => void;

  beforeEach(() => {
    todos = [
      { id: 1, content: "Task 1", completed: false },
      { id: 2, content: "Task 2", completed: true },
    ];
    
    idToIndex = new Map(todos.map((todo, index) => [todo.id, index]));

    updateTodo = (todoId, updatedFields) => {
      const index = idToIndex.get(todoId);
      if (index !== undefined) {
        const newTodos = [...todos];
        newTodos[index] = { ...newTodos[index], ...updatedFields };

        const newMap = new Map();
        newTodos.forEach((todo, idx) => newMap.set(todo.id, idx));

        idToIndex = newMap;
        todos = newTodos;
      }
    };
  });

  it("기존 상태를 유지하면서 업데이트된 필드만 병합해야 함", () => {
    updateTodo(1, { completed: true });

    expect(todos).toEqual([
      { id: 1, content: "Task 1", completed: true },
      { id: 2, content: "Task 2", completed: true },
    ]);
  });

  it("존재하지 않는 id로 업데이트하면 상태가 변경되지 않아야 함", () => {
    updateTodo(999, { completed: true });

    expect(todos).toEqual([
      { id: 1, content: "Task 1", completed: false },
      { id: 2, content: "Task 2", completed: true },
    ]);
  });
});
