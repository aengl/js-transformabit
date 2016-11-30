import { JsBuilder , VariableKind} from './jsbuilder';
import {JsNode} from './jsnode';
import * as ast from 'ast-types';

export type Props = {[name: string]: any}

export class VariableDeclaration extends JsNode<ast.VariableDeclaration> {
  constructor(props: Props, children: Object[]) {
    super();
    let builder = new JsBuilder();
    this._node = builder.variableDeclaration(VariableKind.Let, props['name']);
  }

  getId(): string {
    return (((this._node as ast.VariableDeclaration).declarations[0].id) as ast.Identifier).name;
  }
}


export class Literal extends JsNode<ast.Literal> {
  constructor() {
    super();
  }
}

export class Identifier extends JsNode<ast.Identifier> {
  constructor() {
    super();
  }
}
