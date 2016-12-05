import { Transformation } from './Transformation';
import { GenericJsNode, NamedTypes as t } from './JsNode';
import { Identifier } from 'ast-types';
import { Project } from './Project';

export class RenameVariable implements Transformation {
  oldName: string;
  newName: string;

  constructor() {
  }

  configure(args: any[]): void {
    this.oldName = args[0];
    this.newName = args[1];
  }

  check(root: GenericJsNode, project: Project): boolean {
    return root
      .findChildrenOfType<Identifier>(t.Identifier)
      .has(n => n.node().name === this.oldName);
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType<Identifier>(t.Identifier)
      .forEach(n => {
        if (n.node().name === this.oldName) {
          n.node().name = this.newName;
        }
      });
    return root;
  }
}
