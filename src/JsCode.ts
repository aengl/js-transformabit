import { GenericJsNode } from './JsNode';

export class JsCode {
  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    return new args[0](args[1], children);
  }
}

export * from './jscode/js';
export * from './jscode/react';
