import { JsNode, GenericJsNode } from './JsNode';
import { Node } from 'ast-types';

export class JsCode {
  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    let node = new args[0]();
    node.build(args[1], children);
    return node;
  }
}

export * from './jscode/js';
export * from './jscode/react';
