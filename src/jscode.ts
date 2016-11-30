import {JsBuilder} from './jsbuilder';
import {JsNode, GenericJsNode} from './jsnode';
import * as ast from 'ast-types';

export class JsCode {

  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    return new args[0](args[1], children);
  }
}

/*========================================================================
                            Variable Delcaration
=========================================================================*/

export enum VariableKind {
  Let = 1,
  Const,
  Var
}

export type VariableDeclarationProps = {
  name?: string,
  kind?: VariableKind
}

export class VariableDeclaration extends JsNode<ast.VariableDeclaration> {

  props: VariableDeclarationProps;
  constructor(props: VariableDeclarationProps, children: GenericJsNode[]) {
    super();
    let kindString = this.getKindString(props);
    let declarators = this.getDeclarators(props, children);

    this._node = <ast.VariableDeclaration>ast.builders['variableDeclaration'](kindString, declarators);
  }

  private getKindString(props: VariableDeclarationProps): string {
    if (!props.kind) {
      return "var";
    }

    if (props.kind === VariableKind.Let) {
      return "let";
    } else if (props.kind === VariableKind.Var) {
      return "var";
    } else if (props.kind === VariableKind.Const) {
      return "const";
    } else {
      throw new Error("VariableKind if set must be either Let, Const, Var");
    }
  }

  private getDeclarators(props: VariableDeclarationProps, children: GenericJsNode[]): ast.Node[] {
    let nodes = new Array<ast.Node>();
    if (props.name) {
      nodes.push(new VariableDeclarator({name: props.name}, []).getNode());
      return nodes;
    }
    for (let index in children) {
      if (children[index].check("VariableDeclarator")) {
        nodes.push(children[index].getNode());
      }
    }

    return nodes;
  }

}


/*========================================================================
                            Variable Declarator
=========================================================================*/


export type VariableDeclaratorProps = {
  name: string
}

export class VariableDeclarator extends JsNode<ast.VariableDeclarator> {

  props: VariableDeclaratorProps;
  constructor(props: VariableDeclaratorProps, children: GenericJsNode[]) {
    super();
    let identifier = new Identifier({name: props.name}).getNode();
    this._node = <ast.VariableDeclarator>ast.builders["variableDeclarator"](identifier, null);
  }
}


/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = {
  value: string | number | boolean | null
}

export class Literal extends JsNode<ast.Literal> {

  props: LiteralProps;
  constructor(props: LiteralProps) {
    super();
    this._node = <ast.Literal>ast.builders["literal"](props.value, props.value);
  }
}


/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = {
  name: string
}

export class Identifier extends JsNode<ast.Identifier> {

  props: IdentifierProps;
  constructor(props: IdentifierProps) {
    super();
    this._node = <ast.Identifier>ast.builders["identifier"](props.name);
  }
}
