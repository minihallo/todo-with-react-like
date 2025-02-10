import { VNode } from "../vdom/types";

export interface FunctionComponentInstance {
  type: Function;
  props: any;
  parentDom: HTMLElement;
  _vnode: VNode | null;
  hooks: any[];
  _instanceKey: string;
  _isRemoved: boolean;
}
export class ComponentInstance {
  private static instanceCounter = 0;
  private static instances = new Map<string, FunctionComponentInstance>();

  private static generateInstanceKey(type: Function, props: any): string {
    if (props.key != null) {
      return `${type.name}_${props.key}`;
    }
    
    const instanceId = ++this.instanceCounter;
    return `${type.name}_${instanceId}`;
  }

  static createInstance(
    type: Function,
    props: any,
    parentDom: HTMLElement
  ): FunctionComponentInstance {
    const instanceKey = this.generateInstanceKey(type, props);
    
    const instance: FunctionComponentInstance = {
      type,
      props,
      parentDom,
      _vnode: null,
      hooks: [],
      _instanceKey: instanceKey, // 인스턴스 키 저장
      _isRemoved: false
    };
    
    this.instances.set(instanceKey, instance);
    return instance;
  }

  static getInstance(type: Function, props: any): FunctionComponentInstance | undefined {
    const instanceKey = this.generateInstanceKey(type, props);
    return this.instances.get(instanceKey);
  }

  static updateInstance(
    type: Function,
    props: any,
    updates: Partial<FunctionComponentInstance>
  ) {
    const instanceKey = this.generateInstanceKey(type, props);
    const instance = this.instances.get(instanceKey);
    if (instance) {
      Object.assign(instance, updates);
    }
  }
  static removeInstance(type: Function, props: any) {
    const instanceKey = this.generateInstanceKey(type, props);
    const instance = this.instances.get(instanceKey);
    
    if (instance) {
      if (instance._isRemoved) return;
      instance._isRemoved = true;
      
      Promise.resolve().then(() => {
        if (instance._isRemoved) {
          instance.hooks = [];
          this.instances.delete(instanceKey);
        }
      });
    }
  }

  static isInstanceRemoved(instance: FunctionComponentInstance): boolean {
    return instance._isRemoved === true;
  }
}
