declare namespace JSX {
  interface Element {
    type: string | Function;
    props: any;
    children: Element[];
  }

  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "*.tsx" {
  const content: any;
  export default content;
}
