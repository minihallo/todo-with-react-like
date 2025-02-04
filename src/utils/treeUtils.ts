import { ITodoItem, ITreeTodoItem } from "../types";

export const convertToTree = (todos: ITodoItem[]): ITreeTodoItem[] => {
  const map = new Map<number, ITreeTodoItem>();
  const roots: ITreeTodoItem[] = [];

  // First pass: Create TreeTodoItems and store in map
  todos.forEach(todo => {
    map.set(todo.id, { ...todo, children: [] });
  });

  // Second pass: Build relationships
  todos.forEach(todo => {
    const node = map.get(todo.id)!;
    if (todo.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(todo.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return roots;
};