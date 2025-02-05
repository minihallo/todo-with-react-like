import { VNode, Props } from "./types";

export function createElement(
  type: string | Function,
  props: Props | null,
  ...children: any[]
): VNode {
  return {
    type,
    props: props || {},
    children: children
      .flat()
      .map((child) => {
        if (
          child === false ||
          child === true ||
          child === null ||
          child === undefined
        ) {
          return createTextElement("");
        }
        if (typeof child === "string" || typeof child === "number") {
          return createTextElement(child);
        }
        return child;
      })
      .filter(Boolean), // null, undefined 필터링
    key: props?.key,
  };
}

function createTextElement(text: string | number): VNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
    },
    children: [],
  };
}