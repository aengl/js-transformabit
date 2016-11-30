
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
      nodes.push(new VariableDeclarator({name: props.name}, children).getNode());
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
    let init = this.getInit(children);
    this._node = <ast.VariableDeclarator>ast.builders["variableDeclarator"](identifier, init);
  }

  private getInit(children: GenericJsNode[]): ast.Node {
    if (children.length === 0) {
      return null;
    }
    if (children[0].check(ast.namedTypes.Literal)) {
      return children[0].getNode();
    }

    if (children[0].check(ast.namedTypes.CallExpression)) {
      return children[0].getNode();
    }

    if (children[0].check(ast.namedTypes.Identifier)) {
      return children[0].getNode();
    }

    throw new Error("Init value if specified must be either a literal, identifier, or a call expression");
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


/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  name: string
}

export class CallExpression extends JsNode<ast.CallExpression> {

  props: CallExpressionProps;
  constructor(props: CallExpressionProps, children: GenericJsNode[]) {
    super();
    let identifier = new Identifier({name: props.name}).getNode();
    let args = this.getArgs(children);
    this._node = <ast.CallExpression>ast.builders["callExpression"](identifier, args);
  }

  private getArgs(children: GenericJsNode[]): ast.Node[] {
    let args = new Array<ast.Node>();
    for (let index in children) {
      if (!(children[index] instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (children[index].check(ast.namedTypes.Literal)) {
        args.push(children[index].getNode());
      } else if (children[index].check(ast.namedTypes.Identifier)) {
        args.push(children[index].getNode());
      } else if (children[index].check(ast.namedTypes.CallExpression)) {
        args.push(children[index].getNode());
      } else {
        throw new Error("argument if specified must be either a Literal, Identifier, or a CallExpression");
      }
    }
    return args;
  }
}



/*========================================================================
                            Function Delcaration
=========================================================================*/

export type FunctionDeclarationProps = {
  name: string
}

export class FunctionDeclaration extends JsNode<ast.FunctionDeclaration> {

  props: FunctionDeclarationProps;
  constructor(props: FunctionDeclarationProps, children: GenericJsNode[]) {
    super();

    let identifier = new Identifier({name: props.name}).getNode();
    let params = this.getParameters(children);
    let body = this.getBody(children);

    this._node = <ast.FunctionDeclaration>ast.builders["functionDeclaration"](
      identifier,
      params,
      body
    );

  }

  private getParameters(children: GenericJsNode[]): ast.Node[] {
    let params = Array<ast.Node>();
    for (let index in children) {
      if (children[index].check(ast.namedTypes.Identifier)) {
        params.push(children[index].getNode());
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.Node {
    for (let index in children) {
      if (children[index].check(ast.namedTypes.BlockStatement)) {
        return children[index].getNode();
      }
    }
    return new BlockStatement({}, []).getNode();
  }
}


/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {

}

export class BlockStatement extends JsNode<ast.BlockStatement> {

  props: BlockStatementProps;
  constructor(props: BlockStatementProps, children: GenericJsNode[]) {
    super();
    let statements = new Array<ast.Node>();
    for (let index in children) {
      statements.push(children[index].getNode());
    }
    this._node = <ast.BlockStatement>ast.builders["blockStatement"](statements);
  }
}

/*========================================================================
              Utility for Expression Statement and Return Statement
=========================================================================*/

function getSingleExpression(children: GenericJsNode[], allowNull: boolean, statement: string): ast.Node {
  if (children.length == 0) {
    if (!allowNull) {
      throw new Error("Expression statement must contain 1 statement");
    }
    return null;
  }

  if (children.length > 1) {
    throw new Error("Expression statement can not contain more than 1 statement");
  }

  switch (children[0].getType()) {
    case "Identifier":
    case "Literal":
    case "CallExpression":
      return children[0].getNode();
    default:
      throw new Error("The expression in an " + statement + " must be either an Identifier, CallExpression, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = {

}

export class ExpressionStatement extends JsNode<ast.ExpressionStatement> {

  props: ExpressionStatementProps;
  constructor(props: ExpressionStatementProps, children: GenericJsNode[]) {
    super();
    this._node = <ast.ExpressionStatement>ast.builders["expressionStatement"](getSingleExpression(children, false, "ExpressionStatement"));
  }

}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ReturnStatementProps = {

}

export class ReturnStatement extends JsNode<ast.ReturnStatement> {

  props: ReturnStatementProps;
  constructor(props: ReturnStatementProps, children: GenericJsNode[]) {
    super();
    this._node = <ast.ReturnStatement>ast.builders["returnStatement"](getSingleExpression(children, true, "ReturnStatement"));
  }

}
