import { createElement, useMemo, useGlobalState, useState, useEffect, useRef } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";
import TodoItem from "./TodoItem";
import { convertToTree } from "../utils/treeUtils";
import { useWindowedList } from "../hooks/useWindowedList";
import { todoApi } from "../api";

const PADDING_OFFSET = 24; // Tailwind p-6 (24px)

export default function TodoList() {
  const [todos, setTodos] = useGlobalState<ITodoItem[]>("todos", []);
  const [idToIndex, setIdToIndex] = useState(new Map());
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const fetchedTodos = await todoApi.fetchTodos();

        const map = new Map();
        fetchedTodos.forEach((todo, index) => map.set(todo.id, index));

        setIdToIndex(map);
        setTodos(fetchedTodos);
      } catch (err) {
        // error handling
      }
    };

    fetchTodos();
  }, []);

  const updateTodo = async (todoId: number, updates: Partial<ITodoItem>) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todoId, updates);
      const index = idToIndex.get(todoId);

      if (index !== undefined) {
        const newTodos = [...todos];
        newTodos[index] = { ...newTodos[index], ...updatedTodo };

        const newMap = new Map();
        newTodos.forEach((todo, idx) => newMap.set(todo.id, idx));

        setIdToIndex(newMap);
        setTodos(newTodos);
      }
    } catch (err) {
      // error handling
    }
  };

  const treeData = useMemo<ITreeTodoItem[]>(() => convertToTree(todos), [todos]);

  const itemHeight = 40;

  const { visibleItems, onScroll, topPadding, totalHeight, toggleExpanded, expandedItems } =
    useWindowedList(treeData, itemHeight, containerHeight);

  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(window.innerHeight - rect.top - PADDING_OFFSET);
      }
    };

    window.addEventListener("resize", updateContainerHeight);
    updateContainerHeight();

    return () => {
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, []);
  
  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div
      ref={containerRef}
      className="overflow-auto border border-gray-300 todo-list-container min-h-0"
      onScroll={onScroll}
      style={{ height: `${containerHeight}px` }}
    >
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        <div className="fixed top-0 right-0 bg-black text-white p-2 z-50">
          Rendered: {visibleItems.length} / Total: {treeData.length}
        </div>

        <div className="absolute w-full" style={{ top: `${topPadding}px` }}>
          {visibleItems.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleExpand={() => toggleExpanded(todo.id)}
              onUpdateTodo={updateTodo}
              expandedItems={expandedItems}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
