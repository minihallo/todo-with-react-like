import { todoApi } from "../api";
import { useState, useGlobalState, createElement } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";

interface TodoItemProps {
  key?: number;
  todo: ITreeTodoItem;
  level?: number;
}

export default function TodoItem({ todo, level = 0 }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [todos, setTodos] = useGlobalState<ITodoItem[]>('todos', []);
  const [error, setError] = useGlobalState<string | null>('error', null);

  const handleToggle = async (e: Event) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        completed: !todo.completed
      });
      setTodos(todos.map(t => 
        t.id === todo.id ? { ...t, ...updatedTodo } : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleDelete = async (e: Event) => {
    try {
      await todoApi.deleteTodo(todo.id);
      setTodos(todos.filter(t => t.id !== todo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleExpandClick = (e: Event) => {
    setIsExpanded(!isExpanded);
  };

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
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="w-4 h-4"
        />
        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
          {todo.content}
        </span>
        <button
          onClick={handleDelete}
          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
        >
          🗑
        </button>
      </div>
      {isExpanded && todo.children.length > 0 && (
        <div className="todo-children">
          {todo.children.map(child => (
            <TodoItem
              key={child.id}
              todo={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}