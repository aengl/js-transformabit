import { Transformation } from '../Transformation';
import { GenericJsNode, NamedTypes as t } from '../JsNode';
import { Identifier } from 'ast-types';
import { Project } from '../Project';

export class ExampleEditor implements Transformation {
  constructor() {
  }

  configure(args: any[]): void {
  }

  check(root: GenericJsNode, project: Project): boolean {
    return true;
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType(t.MethodDefinition)
      .removeAll();
    return root;
  }
}
