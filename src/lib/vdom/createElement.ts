
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
      .map((child) =>
        typeof child === "string" || typeof child === "number"
          ? createTextElement(child)
          : child
      ),
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