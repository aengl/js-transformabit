declare namespace transformabit {
  interface JsNode {}
}

declare namespace JSX {
  interface Element extends transformabit.JsNode {
    format(): string;
  }

  interface IntrinsicElements {
    // [name: string]: any;
  }

  interface ElementAttributesProperty {
    props: any;
  }
}
