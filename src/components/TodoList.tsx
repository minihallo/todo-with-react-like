import { createElement, useMemo, useGlobalState } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";
import TodoItem from "./TodoItem";
import { convertToTree } from "../utils/treeUtils";
import { useWindowedList } from "../hooks/useWindowedList";

export default function TodoList({ todos }: { todos: ITodoItem[] }) {
  const treeData = useMemo<ITreeTodoItem[]>(
    () => convertToTree(todos),
    [todos]
  );

  const itemHeight = 40;
  const containerHeight = 600;

  const { visibleItems, onScroll, topPadding, totalHeight, toggleExpanded, expandedItems } =
    useWindowedList(treeData, itemHeight, containerHeight);

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div
      className="h-[600px] overflow-auto border border-gray-300"
      onScroll={onScroll}
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
              expandedItems={expandedItems}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
