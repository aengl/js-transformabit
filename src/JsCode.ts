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

  /**
   * Finds a node of a specific type amongst the JsCode children.
   */
  protected _find(children: GenericJsNode[], type: any): GenericJsNode {
    for (let child of children) {
      if (child instanceof type) {
        return child;
      }
    }
    return null;
  }
}

export * from './jscode/js';
export * from './jscode/react';
