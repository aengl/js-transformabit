import {Transformation} from './Transformation';
import {GenericJsNode} from './jsnode';
import {namedTypes as t, Identifier, Path}  from 'ast-types';
import {Project} from './Project';

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
      .findChildrenOfType(t.Identifier)
      .has<Identifier>(n => n.getNode().name === this.oldName);
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType(t.Identifier)
      .forEach<Identifier>(n => {
        if (n.getNode().name === this.oldName) {
          n.getNode().name = this.newName;
        }
      });
    return root;
  }
}
