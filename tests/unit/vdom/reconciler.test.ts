import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, createElement } from "../../../src/lib";

describe("Virtual DOM과 실제 DOM 업데이트 테스트", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("Virtual DOM이 변경되면 실제 DOM 변경으로 반영되어야 함", () => {
    // 초기 Virtual DOM 렌더링 후 실제 DOM 확인
    const initialVNode = createElement("div", {}, "기존 텍스트");
    render(initialVNode, container);
    expect(container.textContent).toBe("기존 텍스트");

    // Virtual DOM 변경 후 실제 DOM이 업데이트되었는지 확인
    const updatedVNode = createElement("div", {}, "새로운 텍스트");
    render(updatedVNode, container);
    expect(container.textContent).toBe("새로운 텍스트");
  });

  it("변경되지 않은 요소는 다시 렌더링되지 않아야 함", () => {
    const initialVNode = createElement("input", { type: "checkbox", checked: true });
    render(initialVNode, container);
  
    const checkbox = container.querySelector("input") as HTMLInputElement;
  
    const updatedVNode = createElement("input", { type: "checkbox", checked: true });
    render(updatedVNode, container);
  
    expect(container.querySelector("input")).toBe(checkbox);
  });

  it("Virtual DOM 변경 시 최소한의 실제 DOM 변경만 발생해야 함", async () => {
    const initialVNode = createElement("div", {}, "기존 텍스트");
    render(initialVNode, container);
  
    const mutationCallback = vi.fn();
    const observer = new MutationObserver(mutationCallback);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
  
    const updatedVNode = createElement("div", {}, "업데이트된 텍스트");
    render(updatedVNode, container);
  
    await new Promise((resolve) => setTimeout(resolve, 10));
  
    expect(mutationCallback).toHaveBeenCalledTimes(1);
  });
});
