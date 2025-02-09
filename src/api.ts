import { ITodoItem } from "./types";

const API_BASE = "http://localhost:3000";

export const todoApi = {
  async fetchTodos(options?: { signal?: AbortSignal }): Promise<ITodoItem[]> {
    const response = await fetch(`${API_BASE}/todos`, {
      signal: options?.signal,
    });
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  async addTodo(content: string, parentId: number | null = null): Promise<ITodoItem> {
    const response = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (!response.ok) throw new Error("Failed to add todo");
    return response.json();
  },

  updateTodo: async (
    id: number,
    fields: Partial<ITodoItem>,
    options?: { signal?: AbortSignal; updateChildren?: boolean }
  ): Promise<ITodoItem[]> => {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, updateChildren: options?.updateChildren }),
      signal: options?.signal,
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  async deleteTodo(id: number, options?: { signal?: AbortSignal }): Promise<ITodoItem[]> {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    return response.json();
  },
};
