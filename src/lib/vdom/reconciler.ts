
import { Component, ComponentType } from "../component/types";
import { VNode } from "./types";

export function reconcile(
  parentDom: HTMLElement,
  oldVNode: VNode | null,
  newVNode: VNode | null
) {
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
  
  // instance가 없는 경우 처리
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

export function render(vnode: VNode, container: HTMLElement) {
  container.innerHTML = '';
  
  mount(container, vnode);
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
      const component = vnode.type(vnode.props);
      dom = mount(parentDom, component);
    }
  }
  else {
    dom = document.createElement(vnode.type as string);

    Object.entries(vnode.props).forEach(([name, value]) => {
      if (name === "className") {
        (dom as HTMLElement).setAttribute("class", value);
      } else if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        (dom as HTMLElement).addEventListener(eventType, value);
      } else if (name !== "children" && name !== "key") {
        (dom as HTMLElement).setAttribute(name, value);
      }
    });

    vnode.children.forEach((child) => mount(dom as HTMLElement, child));
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
    }
  });

  vnode.children.forEach(unmount);

  vnode._dom.parentNode?.removeChild(vnode._dom);
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

  if (typeof newVNode.type === "function" && newVNode.type.prototype instanceof Component) {
    updateClassComponent(parentDom, oldVNode, newVNode);
    return;
  }

  const dom = oldVNode._dom as HTMLElement;
  newVNode._dom = dom;

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
    } else if (name !== "children" && name !== "key") {
      dom.setAttribute(name, value);
    }
  });

  const maxLength = Math.max(
    oldVNode.children.length,
    newVNode.children.length
  );
  for (let i = 0; i < maxLength; i++) {
    reconcile(dom, oldVNode.children[i] || null, newVNode.children[i] || null);
  }
}
