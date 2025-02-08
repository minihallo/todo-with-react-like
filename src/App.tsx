import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { createElement } from "./lib";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Todo App</h1>
      <TodoForm />
      <TodoList />
    </div>
  );
}