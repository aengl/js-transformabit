import { JsNode, GenericJsNode } from './JsNode';
import { Node } from 'ast-types';

export class JsCode {
  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    return new args[0](args[1], children);
  }
}

export class JsCodeNode<T extends Node, P> extends JsNode<T> {
  props: P;

  constructor(props: P) {
    super();
    this.props = props;
  }
}

export * from './jscode/js';
export * from './jscode/react';
