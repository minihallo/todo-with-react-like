import { todoApi } from "../api";
import { createElement, useGlobalState, useMemo, useState } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";

interface TodoItemProps {
  key?: number;
  todo: ITreeTodoItem;
  level?: number;
}

export default function TodoItem({ todo, level = 0 }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [todos, setTodos] = useGlobalState<ITodoItem[]>("todos", []);
  const [error, setError] = useGlobalState<string | null>("error", null);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskContent, setNewSubTaskContent] = useState("");

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
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleToggle = async (e: Event) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos(
        todos.map((t) => (t.id === todo.id ? { ...t, ...updatedTodo } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleDelete = async (e: Event) => {
    try {
      await todoApi.deleteTodo(todo.id);
      setTodos(todos.filter((t) => t.id !== todo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleExpandClick = (e: Event) => {
    setIsExpanded(!isExpanded);
  };

  const childrenContent = useMemo(() => {
    if (!isExpanded || todo.children.length === 0) return null;

    return (
      <div className="pl-8 mt-2">
        {todo.children.map((child) => (
          <TodoItem key={child.id} todo={child} level={level + 1} />
        ))}
      </div>
    );
  }, [isExpanded, todo.children, level]);

  return (
    <div className="todo-item">
      <div
        className="flex items-center gap-2 py-2 hover:bg-gray-50"
        style={{ paddingLeft: `${level * 24}px` }}
      >
        {todo.children.length > 0 && (
          <button
            onClick={handleExpandClick}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="w-4 h-4"
        />
        <span className={todo.completed ? "line-through text-gray-500" : ""}>
          {todo.content}
        </span>
        <button
          onClick={handleAddSubTask}
          className="ml-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          + 서브태스크
        </button>
        <button
          onClick={handleDelete}
          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
        >
          🗑
        </button>
      </div>

      {isAddingSubTask && (
        <div
          className="flex items-center gap-2 mt-2 pl-4"
          style={{ paddingLeft: `${(level + 1) * 24}px` }}
        >
          <input
            type="text"
            value={newSubTaskContent}
            onChange={(e: Event) =>
              setNewSubTaskContent((e.target as HTMLInputElement).value)
            }
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

      {childrenContent}
    </div>
  );
}
