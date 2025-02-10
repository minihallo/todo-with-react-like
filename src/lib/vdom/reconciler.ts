import { ComponentInstance } from "../component/instance";
import { Component, ComponentType } from "../component/types";
import { resetHooksState } from "../hooks";
import { VNode } from "./types";

export function reconcile(parentDom: HTMLElement, oldVNode: VNode | null, newVNode: VNode | null) {
  if (!oldVNode && !newVNode) return;

  if (!oldVNode) {
    mount(parentDom, newVNode!);
    return;
  }

  if (!newVNode) {
    unmount(oldVNode);
    return;
  }

  update(parentDom, oldVNode, newVNode);
}

function mountClassComponent(parentDom: HTMLElement, vnode: VNode): HTMLElement | Text {
  const ComponentClass = vnode.type as ComponentType;
  const instance = new ComponentClass(vnode.props);

  vnode._instance = instance;
  instance._vnode = vnode;

  const renderedVNode = instance.render();
  instance._rendered = renderedVNode;
  const dom = mount(parentDom, renderedVNode);

  instance._dom = dom;

  if (instance.componentDidMount) {
    instance.componentDidMount();
  }

  return dom;
}

function updateClassComponent(parentDom: HTMLElement, oldVNode: VNode, newVNode: VNode) {
  const instance = oldVNode._instance;

  if (!instance) {
    unmount(oldVNode);
    mount(parentDom, newVNode);
    return;
  }

  const oldProps = instance.props;

  instance.props = newVNode.props;

  newVNode._instance = instance;
  instance._vnode = newVNode;

  const oldRenderedVNode = instance._rendered;
  const newRenderedVNode = instance.render();

  reconcile(parentDom, oldRenderedVNode, newRenderedVNode);
  instance._rendered = newRenderedVNode;

  if (instance.componentDidUpdate) {
    instance.componentDidUpdate(oldProps, instance.state);
  }
}

function mountFunctionComponent(parentDom: HTMLElement, vnode: VNode): HTMLElement | Text {
  const componentFunction = vnode.type as Function;

  const instance = ComponentInstance.createInstance(componentFunction, vnode.props, parentDom);

  resetHooksState(instance);

  const renderedVNode = componentFunction(vnode.props);

  const dom = mount(parentDom, renderedVNode);

  vnode._dom = dom;
  instance._vnode = renderedVNode;

  return dom;
}

function updateFunctionComponent(parentDom: HTMLElement, oldVNode: VNode, newVNode: VNode) {
  const componentFunction = newVNode.type as Function;
  const instance = ComponentInstance.getInstance(componentFunction, newVNode.props);

  if (!instance) {
    unmount(oldVNode);
    mountFunctionComponent(parentDom, newVNode);
    return;
  }

  instance.props = newVNode.props;

  resetHooksState(instance);
  const newRenderedVNode = componentFunction(newVNode.props);

  reconcile(parentDom, instance._vnode, newRenderedVNode);

  instance._vnode = newRenderedVNode;
  newVNode._dom = oldVNode._dom;
}

export function render(vnode: VNode, container: HTMLElement) {
  const oldVNode = container._vnode;
  reconcile(container, oldVNode || null, vnode);
  container._vnode = vnode;
}

function mount(parentDom: HTMLElement, vnode: VNode): HTMLElement | Text {
  let dom: HTMLElement | Text;

  // Text 노드 처리
  if (vnode.type === "TEXT_ELEMENT") {
    dom = document.createTextNode(vnode.props.nodeValue);
  }
  // 컴포넌트 처리
  else if (typeof vnode.type === "function") {
    if (vnode.type.prototype instanceof Component) {
      dom = mountClassComponent(parentDom, vnode);
    } else {
      dom = mountFunctionComponent(parentDom, vnode);
    }
  } else {
    dom = document.createElement(vnode.type as string);

    Object.entries(vnode.props).forEach(([name, value]) => {
      if (name === "className") {
        (dom as HTMLElement).setAttribute("class", value);
      } else if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        (dom as HTMLElement).addEventListener(eventType, value);
      } else if (name === "value" && dom instanceof HTMLInputElement) {
        dom.value = value;
      } else if (name === "checked" && dom instanceof HTMLInputElement) {
        dom.checked = value;
      } else if (name === "style" && typeof value === "object") {
        Object.entries(value).forEach(([styleName, styleValue]) => {
          (dom as HTMLElement).style.setProperty(
            styleName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
            String(styleValue)
          );
        });
      } else if (name !== "children" && name !== "key") {
        (dom as HTMLElement).setAttribute(name, value);
      }
    });

    vnode.children.forEach((child) => mount(dom as HTMLElement, child));
  }

  if (vnode.ref) {
    if (typeof vnode.ref === "function") {
      vnode.ref(dom as HTMLElement);
    } else if (typeof vnode.ref === "object") {
      vnode.ref.current = dom as HTMLElement;
    }
  }

  vnode._dom = dom;
  parentDom.appendChild(dom);
  return dom;
}

function unmount(vnode: VNode) {
  if (!vnode._dom) return;

  Object.entries(vnode.props).forEach(([name, value]) => {
    if (name.startsWith("on")) {
      const eventType = name.toLowerCase().substring(2);
      vnode._dom?.removeEventListener(eventType, value);
    } else if (name === "style" && vnode._dom) {
      const style = vnode.props.style;
      if (typeof style === "object") {
        Object.keys(style).forEach((styleName) => {
          (vnode._dom as HTMLElement).style.removeProperty(
            styleName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
          );
        });
      }
    }
  });

  vnode.children.forEach(unmount);

  vnode._dom.parentNode?.removeChild(vnode._dom);

  if (typeof vnode.type === "function") {
    ComponentInstance.removeInstance(vnode.type, vnode.props);
  }

  if (vnode.ref) {
    if (typeof vnode.ref === "function") {
      vnode.ref(null);
    } else if (typeof vnode.ref === "object") {
      vnode.ref.current = null;
    }
  }
}

function update(parentDom: HTMLElement, oldVNode: VNode, newVNode: VNode) {
  if (oldVNode.type !== newVNode.type) {
    unmount(oldVNode);
    mount(parentDom, newVNode);
    return;
  }

  if (newVNode.type === "TEXT_ELEMENT") {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      oldVNode._dom!.nodeValue = newVNode.props.nodeValue;
    }
    newVNode._dom = oldVNode._dom;
    return;
  }

  if (typeof newVNode.type === "function") {
    if (newVNode.type.prototype instanceof Component) {
      updateClassComponent(parentDom, oldVNode, newVNode);
    } else {
      updateFunctionComponent(parentDom, oldVNode, newVNode);
    }
    return;
  }

  const dom = oldVNode._dom as HTMLElement;
  newVNode._dom = dom;

  if (oldVNode.ref !== newVNode.ref) {
    if (oldVNode.ref) {
      if (typeof oldVNode.ref === "function") {
        oldVNode.ref(null);
      } else if (typeof oldVNode.ref === "object") {
        oldVNode.ref.current = null;
      }
    }
    if (newVNode.ref) {
      if (typeof newVNode.ref === "function") {
        newVNode.ref(dom as HTMLElement);
      } else if (typeof newVNode.ref === "object") {
        newVNode.ref.current = dom as HTMLElement;
      }
    }
  }

  Object.keys(oldVNode.props).forEach((name) => {
    if (name.startsWith("on")) {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, oldVNode.props[name]);
    }
  });

  Object.entries(newVNode.props).forEach(([name, value]) => {
    if (name === "className") {
      dom.setAttribute("class", value);
    } else if (name.startsWith("on")) {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, value);
    } else if (name === "value" && dom instanceof HTMLInputElement) {
      dom.value = value;
    } else if (name === "checked" && dom instanceof HTMLInputElement) {
      dom.checked = value;
    } else if (name === "style" && typeof value === "object") {
      Object.entries(value).forEach(([styleName, styleValue]) => {
        (dom as HTMLElement).style.setProperty(
          styleName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
          String(styleValue)
        );
      });
    } else if (name !== "children" && name !== "key") {
      dom.setAttribute(name, value);
    }
  });

  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;

  const oldChildrenMap = new Map();
  oldChildren.forEach((child, i) => {
    const key = child.props.key ?? i;
    oldChildrenMap.set(key, child);
  });

  let previousSibling: Node | null = null;
  newChildren.forEach((newChild, newIndex) => {
    const key = newChild.props.key ?? newIndex;
    const oldChild = oldChildrenMap.get(key);

    if (oldChild) {
      reconcile(dom, oldChild, newChild);
      if (newChild._dom) {
        if (previousSibling && previousSibling.nextSibling !== newChild._dom) {
          dom.insertBefore(newChild._dom, previousSibling.nextSibling);
        }
        previousSibling = newChild._dom;
      }
      oldChildrenMap.delete(key);
    } else {
      mount(dom, newChild);
      if (newChild._dom) {
        if (previousSibling) {
          dom.insertBefore(newChild._dom, previousSibling.nextSibling);
        } else {
          dom.insertBefore(newChild._dom, dom.firstChild);
        }
        previousSibling = newChild._dom;
      }
    }
  });

  oldChildrenMap.forEach((remainingChild) => {
    unmount(remainingChild);
  });
}
