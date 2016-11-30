declare namespace JSX {
  interface Element {
    [name: string]: any;
  }

  interface IntrinsicElements {
    // [name: string]: any;
  }

  interface ElementAttributesProperty {
    props: any;
  }
}
