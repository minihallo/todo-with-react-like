export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: VNode[];
  key?: string | number;
  _dom?: HTMLElement | Text;
}

export type Props = {
  children?: VNode[];
  key?: string | number;
  [key: string]: any;
};