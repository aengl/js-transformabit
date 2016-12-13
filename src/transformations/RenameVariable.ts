import { Transformation } from '../Transformation';
import { GenericJsNode } from '../JsNode';
import { Project } from '../Project';
import { Identifier } from '../jscode/js';

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
      .findChildrenOfType(Identifier)
      .has(n => n.node.name === this.oldName);
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType(Identifier)
      .forEach(n => {
        if (n.node.name === this.oldName) {
          n.node.name = this.newName;
        }
      });
    return root;
  }
}
