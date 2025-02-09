import { createElement, useMemo, useGlobalState, useState, useEffect, useRef } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";
import TodoItem from "./TodoItem";
import { convertToTree } from "../utils/treeUtils";
import { useWindowedList } from "../hooks/useWindowedList";
import { todoApi } from "../api";

const PADDING_OFFSET = 24; // Tailwind p-6 (24px)

export default function TodoList() {
  const [todos, setTodos] = useGlobalState<ITodoItem[]>("todos", []);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const fetchedTodos = await todoApi.fetchTodos();

        const map = new Map();
        fetchedTodos.forEach((todo, index) => map.set(todo.id, index));

        setTodos(fetchedTodos);
      } catch (err) {
        console.error('Todo 목록 조회 실패:', err);
      }
    };

    fetchTodos();
  }, []);

  const updateTodo = async (todoIds: number[], updatedFieldsMap: Record<number, Partial<ITodoItem>>) => {
    const newTodos = todos.map(todo => {
      if (todoIds.includes(todo.id)) {
        return { ...todo, ...updatedFieldsMap[todo.id] };
      }
      return todo;
    });
    setTodos(newTodos);
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

  return (
    <div
      ref={containerRef}
      className="overflow-auto border border-gray-300 todo-list-container min-h-0"
      onScroll={onScroll}
      style={{ height: `${containerHeight}px` }}
    >
      <div className="relative" style={{ height: `${totalHeight}px` }}>
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
