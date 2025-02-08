import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement, useState, render } from "../../../src/lib";
import TodoItem from "../../../src/components/TodoItem";
import { todoApi } from "../../../src/api";
import { waitFor } from "@testing-library/dom";

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib");
  return {
    ...actual,
    useGlobalState: vi.fn().mockImplementation(() => {
      const [state, setState] = useState([]);
      return [state, setState];
    }),
  };
});

vi.mock("../api", () => ({
  todoApi: {
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

describe("TodoItem", () => {
  let container: HTMLElement | null;

  const mockTodo = {
    id: 1,
    content: "Test Todo",
    completed: false,
    parentId: null,
    level: 0,
    children: [],
  };

  const mockProps = {
    todo: mockTodo,
    expandedItems: new Set<number>(),
    onToggleExpand: vi.fn(),
    onUpdateTodo: vi.fn(),
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("체크박스 낙관적 업데이트, 요청 실패시 원래 상태로 되돌림", async () => {
    // updateTodo API가 실패하도록 Mock 설정
    vi.spyOn(todoApi, "updateTodo").mockRejectedValue(new Error("Server Error"));

    const vnode = createElement(TodoItem, mockProps);
    if (!container) return;
    render(vnode, container);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    checkbox.click();

    expect(checkbox.checked).toBe(true);

    await vi.runAllTimersAsync();

    expect(checkbox.checked).toBe(false);
  }, 2000);

  it("이전 업데이트 요청이 진행 중일 때 새로운 요청이 들어오면 이전 요청을 취소", async () => {
    const abortSpy = vi.fn();
    const mockAbortController = {
      signal: new AbortController().signal,
      abort: abortSpy,
    };

    vi.spyOn(global, "AbortController").mockImplementation(
      () =>
        ({
          signal: mockAbortController.signal,
          abort: abortSpy,
        } as any)
    );

    // updateTodo를 즉시 응답하도록 설정
    const updateTodoMock = vi.spyOn(todoApi, "updateTodo").mockResolvedValue({ completed: true });

    const vnode = createElement(TodoItem, mockProps);
    if (!container) return;
    render(vnode, container);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.click();
    checkbox.click();

    // 첫 번째 요청이 취소되었는지 확인
    expect(abortSpy).toHaveBeenCalled();

    await vi.runAllTimersAsync();

    await expect(updateTodoMock).toHaveBeenCalledTimes(2);
  }, 2000);

  it("할 일을 삭제할 때 서버 오류가 발생하면 상태가 유지되어야 함", async () => {
    vi.spyOn(todoApi, "deleteTodo").mockRejectedValue(new Error("Server Error"));
  
    const vnode = createElement(TodoItem, mockProps);
    if (!container) return;
    render(vnode, container);
  
    const deleteButton = container.querySelector("button.delete-button") as HTMLButtonElement;
  
    const initialTodos = [...mockProps.todo.children];
  
    deleteButton.click();
  
    await waitFor(() => {
      expect(mockProps.todo.children).toEqual(initialTodos);
    });
  }, 2000);

  it("하위 작업 추가 시 서버 오류가 발생하면 입력 내용이 유지되어야 함", async () => {
    vi.spyOn(todoApi, "addTodo").mockRejectedValue(new Error("Server Error"));
  
    const vnode = createElement(TodoItem, mockProps);
    if (!container) return;
    render(vnode, container);
  
    // 하위작업 추가 버튼 클릭으로 입력폼 생성
    const addSubTaskButton = container.querySelector("button.add-subtask-button") as HTMLButtonElement;
    addSubTaskButton.click();
  
    await waitFor(() => {
      expect(container!.querySelector("input[type='text']")).not.toBeNull();
    });

    const input = container.querySelector("input[type='text']") as HTMLInputElement;
  
    input.value = "새 하위 작업";
    input.dispatchEvent(new Event("input"));
  
    // 하위작업 추가 실행
    const submitButton = container.querySelector("button.submit-subtask-button") as HTMLButtonElement;
    submitButton.click();
  
    // 서버 요청이 실패한 후에도 입력값이 유지되어야 함
    await waitFor(() => {
      expect(input.value).toBe("새 하위 작업");
    });
  }, 2000);
});
