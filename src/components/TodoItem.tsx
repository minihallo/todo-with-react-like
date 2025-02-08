import { todoApi } from "../api";
import { createElement, useEffect, useGlobalState, useMemo, useRef, useState } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";

interface TodoItemProps {
  key?: number;
  todo: ITreeTodoItem;
  expandedItems: Set<number>;
  onToggleExpand: () => void;
  onUpdateTodo: (todoId: number, updates: Partial<ITodoItem>) => Promise<void>;
}

export default function TodoItem({
  todo,
  onToggleExpand,
  onUpdateTodo,
  expandedItems,
}: TodoItemProps) {
  const [todos, setTodos] = useGlobalState<ITodoItem[]>("todos", []);
  // const [error, setError] = useGlobalState<string | null>("error", null);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskContent, setNewSubTaskContent] = useState("");
  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const handleAddSubTask = () => {
    setIsAddingSubTask(true);
  };

  const handleSubTaskCancel = () => {
    setIsAddingSubTask(false);
    setNewSubTaskContent("");
  };

  const handleSubTaskSubmit = async (e: Event) => {
    e.preventDefault();
    if (!newSubTaskContent.trim()) return;

    try {
      const newSubTodo = await todoApi.addTodo(newSubTaskContent, todo.id);
      setTodos([...todos, newSubTodo]);
      setNewSubTaskContent("");
      setIsAddingSubTask(false);
      onToggleExpand();
    } catch (err) {
      // setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleToggle = async (e: Event) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        completed: !isCompleted,
      });
      setIsCompleted(updatedTodo.completed);
      onUpdateTodo(todo.id, {
        completed: !isCompleted,
      });
    } catch (err) {
      // setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleDelete = async (e: Event) => {
    try {
      const getDeleteIds = (todoId: number): number[] => {
        const ids: number[] = [todoId];
        const findChildren = (parentId: number) => {
          const children = todos.filter((t) => t.parentId === parentId);
          children.forEach((child) => {
            ids.push(child.id);
            findChildren(child.id);
          });
        };

        findChildren(todoId);
        return ids;
      };

      const deleteIds = getDeleteIds(todo.id);

      await Promise.all(deleteIds.map((id) => todoApi.deleteTodo(id)));
      setTodos(todos.filter((t) => !deleteIds.includes(t.id)));
    } catch (err) {
      // setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleExpandClick = (e: Event) => {
    e.stopPropagation();
    onToggleExpand();
  };

  return (
    <div className="todo-item">
      <div
        className="flex items-center gap-2 py-2 hover:bg-gray-50 ml-4"
        style={{ paddingLeft: `${todo.level * 24}px` }}
      >
        <div className="w-6">
          {todo.children.length > 0 && (
            <button onClick={handleExpandClick} className="p-1 hover:bg-gray-200 rounded">
              {expandedItems.has(todo.id) ? "▼" : "▶"}
            </button>
          )}
        </div>
        <input type="checkbox" checked={isCompleted} onChange={handleToggle} className="w-4 h-4" />
        <span className={isCompleted ? "line-through text-gray-500" : ""}>{todo.content}</span>
        <button
          onClick={handleAddSubTask}
          className="ml-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          + 하위작업 추가
        </button>
        <button
          onClick={handleDelete}
          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded mr-4"
        >
          🗑
        </button>
      </div>

      {isAddingSubTask && (
        <div
          className="flex items-center gap-2 mt-2 pl-4"
          style={{ paddingLeft: `${(todo.level + 1) * 24}px` }}
        >
          <input
            type="text"
            value={newSubTaskContent}
            onChange={(e: Event) => setNewSubTaskContent((e.target as HTMLInputElement).value)}
            placeholder="새 하위작업 입력..."
            className="flex-1 p-2 border rounded"
            autoFocus
          />
          <button
            onClick={handleSubTaskSubmit}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            추가
          </button>
          <button
            onClick={handleSubTaskCancel}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
