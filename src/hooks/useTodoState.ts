import { create } from 'zustand';
import { ITodoItem } from '../types';
import { todoApi } from '../api';

interface TodoState {
  todos: ITodoItem[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (content: string, parentId?: number | null) => Promise<void>;
  updateTodo: (id: number, updates: Partial<ITodoItem>) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

export const useTodoState = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await todoApi.fetchTodos();
      set({ todos, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addTodo: async (content, parentId = null) => {
    try {
      const newTodo = await todoApi.addTodo(content, parentId);
      set(state => ({ todos: [...state.todos, newTodo] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      set(state => ({
        todos: state.todos.map(todo => 
          todo.id === id ? { ...todo, ...updatedTodo } : todo
        )
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteTodo: async (id) => {
    try {
      await todoApi.deleteTodo(id);
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== id)
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  }
}));