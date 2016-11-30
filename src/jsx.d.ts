// import { JsNode } from './jsnode';

declare namespace JSX {
  // interface Element extends JsNode<any> {}
  interface Element {
    format(): string;
  }

  interface IntrinsicElements {
    // [name: string]: any;
  }

  interface ElementAttributesProperty {
    props: any;
  }
}
