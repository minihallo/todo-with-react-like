import { todoApi } from "../api";
import { useState, useGlobalState, createElement } from "../lib";
import { ITodoItem } from "../types";

export default function TodoForm() {
  const [content, setContent] = useState('');
  const [todos, setTodos] = useGlobalState<ITodoItem[]>('todos', []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const newTodo = await todoApi.addTodo(content, null);
      setTodos([...todos, newTodo]);
      setContent('');
    } catch (err) {
      alert("작업 추가 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
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