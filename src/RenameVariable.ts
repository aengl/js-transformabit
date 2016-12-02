import {Transformation} from './Transformation';
import {GenericJsNode} from './jsnode';
import {namedTypes as t, Identifier, Path}  from 'ast-types';
import {Project} from './Project'


export class RenameVariable implements Transformation {

  oldName: string
  newName: string

  constructor() {
  }


  configure(args: any[]): void {
    this.oldName = args[0];
    this.newName = args[1];
  }

  check(root: GenericJsNode, project: Project): boolean {
    let identifiers = root.findChildrenOfType(t.Identifier);
    for (const path of identifiers._paths) {
      if ((path.value as Identifier).name === this.oldName) {
        return true;
      }
    }
    return false;
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    let identifiers = root.findChildrenOfType(t.Identifier);
    identifiers._paths.forEach(p => this.changeIfOldName(p));
    return root;
  }

  changeIfOldName(path: Path): void {
    if ((path.value as Identifier).name == this.oldName) {
      (path.value as Identifier).name = this.newName;
    }
  }
}
