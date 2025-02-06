import { VNode, Props } from "./types";

export function createElement(
  type: string | Function,
  props: Props | null,
  ...children: any[]
): VNode {
  const processedProps = { ...(props || {}) };
  const ref = props?.ref;
  
  if ('ref' in processedProps) {
    delete processedProps.ref;
  }

  return {
    type,
    props: processedProps,
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
      .filter(Boolean),
    key: props?.key,
    ref: ref,
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