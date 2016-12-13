import { Transformation } from '../Transformation';
import { GenericJsNode } from '../JsNode';
import { Project } from '../Project';
import { MethodDefinition } from '../jscode/js';

export class DemoEditor implements Transformation {
  constructor() {
  }

  configure(args: any[]): void {
  }

  check(root: GenericJsNode, project: Project): boolean {
    return true;
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType(MethodDefinition)
      .filter(node => node.methodName() === 'render')
      .removeAll();
    return root;
  }
}
