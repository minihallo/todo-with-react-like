import { Component } from "../component/types";

declare global {
  interface HTMLElement {
    _vnode?: VNode | null;
  }
}

export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: VNode[];
  key?: string | number;
  _dom?: HTMLElement | Text;
  _instance?: Component;
  _rendered?: VNode;
}

export type Props = {
  children?: VNode[];
  key?: string | number;
  [key: string]: any;
};