import { describe, test, expect, vi, beforeEach } from 'vitest';
import { todoApi } from '../../../src/api';
import { ITodoItem } from '../../../src/types';

const mockTodos: ITodoItem[] = [
  { id: 1, content: '테스트 할일', parentId: null, completed: false },
  { id: 2, content: '하위 할일', parentId: 1, completed: false }
];

describe('Todo API 테스트', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  test('할일 목록 요청이 성공하면 데이터를 반환해야 함', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTodos)
    });

    const todos = await todoApi.fetchTodos();
    expect(todos).toEqual(mockTodos);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/todos', expect.anything());
  });

  test('네트워크 오류 발생 시 에러를 던져야 함', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    await expect(todoApi.fetchTodos()).rejects.toThrow('Network error');
  });

  test('할일 추가 요청 시 올바른 데이터를 전송해야 함', async () => {
    const newTodo = { id: 3, content: '새로운 할일', parentId: null, completed: false };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTodo)
    });

    const result = await todoApi.addTodo('새로운 할일');
    expect(result).toEqual(newTodo);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/todos',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '새로운 할일', parentId: null })
      })
    );
  });

  test('할일 수정 요청 시 올바른 데이터를 전송해야 함', async () => {
    const updatedTodo = { id: 1, content: '수정된 할일', completed: true, parentId: null };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedTodo)
    });

    const result = await todoApi.updateTodo(1, { content: '수정된 할일', completed: true });
    expect(result).toEqual(updatedTodo);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/todos/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  test('할일 삭제 요청이 올바르게 처리되어야 함', async () => {
    const deletedTodo = { id: 1, content: '삭제된 할일', parentId: null, completed: false };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(deletedTodo)
    });

    const result = await todoApi.deleteTodo(1);
    expect(result).toEqual(deletedTodo);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/todos/1',
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  test('서버 에러 응답 시 적절한 에러를 던져야 함', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(todoApi.fetchTodos()).rejects.toThrow('Failed to fetch todos');
  });
});