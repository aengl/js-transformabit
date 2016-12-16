import { Transformation } from '../Transformation';
import { GenericJsNode } from '../JsNode';
import { Project } from '../Project';
import { MethodDefinition } from '../jscode/js';
import { ReactComponent, ReactClassComponent } from '../jscode/react';

export class DemoEditor implements Transformation {
  constructor() {
  }

  configure(args: any[]): void {
  }

  check(root: GenericJsNode, project: Project): boolean {
    return true;
  }

  // apply(root: GenericJsNode, project: Project): GenericJsNode {
  //   root
  //     .findChildrenOfType(MethodDefinition)
  //     .filter(node => node.methodName() === 'render')
  //     .removeAll();
  //   return root;
  // }

  apply(root: GenericJsNode, project: Project): ReactComponent {
    if (root.check(ReactClassComponent)) {
      return root.convertToReactComponent();
    }
  }
}
