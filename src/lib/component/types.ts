import { reconcile } from "../vdom/reconciler";
import { VNode } from "../vdom/types";

export interface ComponentType<P = any> {
  new (props: P): Component<P>;
}

export abstract class Component<P = any, S = any> {
  props: P;
  state: S;
  _vnode: any;
  _dom: HTMLElement | Text | null;
  _pendingState: S | null;
  _rendered: VNode | null;

  constructor(props: P) {
    this.props = props;
    this.state = {} as S;
    this._vnode = null;
    this._dom = null;
    this._pendingState = null;
    this._rendered = null;
  }

  setState(
    partialState: Partial<S> | ((prevState: S, props: P) => Partial<S>)
  ) {
    this._pendingState = {
      ...this.state,
      ...(typeof partialState === "function"
        ? (partialState as Function)(this.state, this.props)
        : partialState),
    } as S;

    scheduleUpdate(this);
  }

  // 라이프사이클 메서드
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  componentDidUpdate?(prevProps: P, prevState: S): void;

  abstract render(): any;
}

let updateQueue: Component[] = [];
let isProcessing = false;

function scheduleUpdate(component: Component) {
  if (!updateQueue.includes(component)) {
    updateQueue.push(component);
  }

  if (!isProcessing) {
    isProcessing = true;
    Promise.resolve().then(processUpdateQueue);
  }
}

function processUpdateQueue() {
  const queue = updateQueue;
  updateQueue = [];
  isProcessing = false;

  queue.forEach((component) => {
    if (component._pendingState) {
      const prevState = component.state;
      component.state = component._pendingState;
      component._pendingState = null;

      const newVNode = component.render();
      reconcileComponent(component, newVNode);

      if (component.componentDidUpdate) {
        component.componentDidUpdate(component.props, prevState);
      }
    }
  });
}

function reconcileComponent(component: Component, newVNode: VNode) {
  const parentDom = component._dom?.parentNode as HTMLElement;
  
  if (!parentDom) return;

  reconcile(parentDom, component._rendered, newVNode);
  
  component._rendered = newVNode;
  component._vnode = newVNode;
}