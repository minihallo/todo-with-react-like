import { VNode } from "../vdom/types";

export interface FunctionComponentInstance {
  type: Function;
  props: any;
  parentDom: HTMLElement;
  _vnode: VNode | null;
  hooks: any[];
}

export class ComponentInstance {
  private static instances = new Map<Function, FunctionComponentInstance>();

  static createInstance(
    type: Function,
    props: any,
    parentDom: HTMLElement
  ): FunctionComponentInstance {
    const instance: FunctionComponentInstance = {
      type,
      props,
      parentDom,
      _vnode: null,
      hooks: [],
    };
    this.instances.set(type, instance);
    return instance;
  }

  static getInstance(type: Function): FunctionComponentInstance | undefined {
    return this.instances.get(type);
  }

  static updateInstance(
    type: Function,
    updates: Partial<FunctionComponentInstance>
  ) {
    const instance = this.instances.get(type);
    if (instance) {
      Object.assign(instance, updates);
    }
  }
}
