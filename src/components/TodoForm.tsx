import { todoApi } from "../api";
import { useState, useGlobalState, createElement } from "../lib";
import { ITodoItem } from "../types";

export default function TodoForm({ parentId = null }) {
  const [content, setContent] = useState('');
  const [todos, setTodos] = useGlobalState<ITodoItem[]>('todos', []);
  const [error, setError] = useGlobalState<string | null>('error', null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const newTodo = await todoApi.addTodo(content, parentId);
      setTodos([...todos, newTodo]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={content}
        onInput={(e: InputEvent) => setContent((e.target as HTMLInputElement).value)}
        placeholder="Add new todo..."
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add
      </button>
    </form>
  );
}