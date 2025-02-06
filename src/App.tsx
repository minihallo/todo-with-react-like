import { todoApi } from "./api";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import TodoList from "./components/TodoList";
import CounterA from "./CounterA";
import CounterB from "./CounterB";
import {
  createElement,
  useGlobalState,
  useEffect,
} from "./lib";
import { ITodoItem, ITreeTodoItem } from "./types";

export default function App() {
  const [todos, setTodos] = useGlobalState<ITodoItem[]>("todos", []);
  // const [isLoading, setIsLoading] = useGlobalState<boolean>("isLoading", false);
  // const [error, setError] = useGlobalState<string | null>("error", null);

  useEffect(() => {
    const fetchTodos = async () => {
      // setIsLoading(true);
      try {
        const fetchedTodos = await todoApi.fetchTodos();
        setTodos(fetchedTodos);
      } catch (err) {
        // setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        // setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Todo App</h1>
      <TodoForm />
      <TodoList todos={todos} />
    </div>
  );
}
