import { Transformation } from '../Transformation';
import { GenericJsNode, NamedTypes as t } from '../JsNode';
import { Project } from '../Project';
import * as ast from 'ast-types';

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
      .findChildrenOfType<ast.MethodDefinition>(t.MethodDefinition)
      .filter(node => (node.node().key as ast.Identifier).name === 'render')
      .removeAll();
    return root;
  }
}
