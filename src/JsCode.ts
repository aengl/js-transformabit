/**
 * JSX factory.
 *
 * Needs to be imported in order for the JSX syntax to work.
 */

import { GenericJsNode } from './JsNode';

export class JsCode {
  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    let node = new func();
    node.build(props || {}, children || []);
    return node;
  }
}
