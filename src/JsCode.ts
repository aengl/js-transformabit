
import { JsNode, GenericJsNode, NamedTypes as t } from './JsNode';
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

/**
 * Right now, string enums are a bit of a hack but will become properly
 * supported in the future: https://github.com/Microsoft/TypeScript/issues/1206
 */
export enum VariableKind {
  Let = <any>'let',
  Const = <any>'const',
  Var = <any>'var'
}

export type VariableDeclarationProps = {
  name?: string,
  kind?: VariableKind
};

export class VariableDeclaration extends JsNode<ast.VariableDeclaration> {

  props: VariableDeclarationProps;
  constructor(props: VariableDeclarationProps, children: GenericJsNode[]) {
    super();
    let kindString = props.kind || VariableKind.Var;
    let declarators = this.getDeclarators(props, children);

    this._node = <ast.VariableDeclaration>ast.builders['variableDeclaration'](kindString, declarators);
  }

  private getDeclarators(props: VariableDeclarationProps, children: GenericJsNode[]): ast.Node[] {
    let nodes = new Array<ast.Node>();
    if (props.name) {
      nodes.push(new VariableDeclarator({ name: props.name }, children).node());
      return nodes;
    }
    for (let index in children) {
      if (children[index].check(t.VariableDeclarator)) {
        nodes.push(children[index].node());
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
};

export class VariableDeclarator extends JsNode<ast.VariableDeclarator> {

  props: VariableDeclaratorProps;
  constructor(props: VariableDeclaratorProps, children: GenericJsNode[]) {
    super();
    let identifier = new Identifier({ name: props.name }).node();
    let init = this.getInit(children);
    this._node = <ast.VariableDeclarator>ast.builders["variableDeclarator"](identifier, init);
  }

  private getInit(children: GenericJsNode[]): ast.Node {
    if (children.length === 0) {
      return null;
    }
    if (children[0].check(ast.namedTypes.Literal)) {
      return children[0].node();
    }

    if (children[0].check(ast.namedTypes.CallExpression)) {
      return children[0].node();
    }

    if (children[0].check(ast.namedTypes.Identifier)) {
      return children[0].node();
    }

    throw new Error("Init value if specified must be either a literal, identifier, or a call expression");
  }
}


/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = {
  value: string | number | boolean | null
};

export class Literal extends JsNode<ast.Literal> {

  props: LiteralProps;
  constructor(props: LiteralProps) {
    super(<ast.Literal>ast.builders["literal"](props.value, props.value));
  }
}


/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = {
  name: string
};

export class Identifier extends JsNode<ast.Identifier> {

  props: IdentifierProps;
  constructor(props: IdentifierProps) {
    super(<ast.Identifier>ast.builders["identifier"](props.name));
  }
}


/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  callee: Identifier | MemberExpression
};

export class CallExpression extends JsNode<ast.CallExpression> {

  props: CallExpressionProps;
  constructor(props: CallExpressionProps, children: GenericJsNode[]) {
    super();
    let callee = props.callee.node();
    let args = this.getArgs(children);
    this._node = <ast.CallExpression>ast.builders["callExpression"](callee, args);
  }

  private getArgs(children: GenericJsNode[]): ast.Node[] {
    let args = new Array<ast.Node>();
    for (let index in children) {
      if (!(children[index] instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (children[index].check(ast.namedTypes.Literal)) {
        args.push(children[index].node());
      } else if (children[index].check(ast.namedTypes.Identifier)) {
        args.push(children[index].node());
      } else if (children[index].check(ast.namedTypes.CallExpression)) {
        args.push(children[index].node());
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
};

export class FunctionDeclaration extends JsNode<ast.FunctionDeclaration> {

  props: FunctionDeclarationProps;
  constructor(props: FunctionDeclarationProps, children: GenericJsNode[]) {
    super();

    let identifier = new Identifier({ name: props.name }).node();
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
        params.push(children[index].node());
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.Node {
    for (let index in children) {
      if (children[index].check(ast.namedTypes.BlockStatement)) {
        return children[index].node();
      }
    }
    return new BlockStatement({}, []).node();
  }
}


/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {

};

export class BlockStatement extends JsNode<ast.BlockStatement> {

  props: BlockStatementProps;
  constructor(props: BlockStatementProps, children: GenericJsNode[]) {
    super();
    let statements = new Array<ast.Node>();
    for (let index in children) {
      statements.push(children[index].node());
    }
    this._node = <ast.BlockStatement>ast.builders["blockStatement"](statements);
  }
}

/*========================================================================
              Utility for Expression Statement and Return Statement
=========================================================================*/

function getSingleExpression(children: GenericJsNode[], allowNull: boolean, statement: string): ast.Node {
  if (children.length === 0) {
    if (!allowNull) {
      throw new Error("Expression statement must contain 1 statement");
    }
    return null;
  }

  if (children.length > 1) {
    throw new Error("Expression statement can not contain more than 1 statement");
  }

  switch (children[0].type()) {
    case "Identifier":
    case "Literal":
    case "CallExpression":
      return children[0].node();
    default:
      throw new Error("The expression in an " + statement + " must be either an Identifier, CallExpression, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = {

};

export class ExpressionStatement extends JsNode<ast.ExpressionStatement> {

  props: ExpressionStatementProps;
  constructor(props: ExpressionStatementProps, children: GenericJsNode[]) {
    super(<ast.ExpressionStatement>ast.builders["expressionStatement"](
      getSingleExpression(children, false, t.ExpressionStatement.toString())));
  }

}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {

};

export class ReturnStatement extends JsNode<ast.ReturnStatement> {

  props: ReturnStatementProps;
  constructor(props: ReturnStatementProps, children: GenericJsNode[]) {
    super(<ast.ReturnStatement>ast.builders["returnStatement"](
      getSingleExpression(children, true, t.ReturnStatement.toString())));
  }

}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = {

};

export class ThisExpression extends JsNode<ast.ThisExpression> {

  props: ThisExpressionProps;
  constructor(props: ThisExpressionProps, children: GenericJsNode[]) {
    super(<ast.ThisExpression>ast.builders["thisExpression"]());
  }
}

/*========================================================================
                            Member Expression
=========================================================================*/

export type MemberExpressionProps = {
  object?: ThisExpression | MemberExpression,
  property: Identifier
};

export class MemberExpression extends JsNode<ast.MemberExpression> {

  props: MemberExpressionProps;
  constructor(props: MemberExpressionProps, children: GenericJsNode[]) {
    super();
    let object: ast.Node;
    if (!props.object) {
      object = new ThisExpression({}, []).node();
    } else {
      object = props.object.node();
    }
    this._node = <ast.MemberExpression>ast.builders["memberExpression"](object, props.property.node());
  }
}

/*========================================================================
                            Assignment Expression
=========================================================================*/

export enum AssignmentOperator {
  Equals = <any>'=',
  PlusEquals = <any>'+=',
  MinusEquals = <any>'-=',
  MultiplyEquals = <any>'*=',
  DivideEquals = <any>'/=',
  ModularEquals = <any>'%=',
  ShiftLeftEquals = <any>'<<=',
  ShiftRightEquals = <any>'>>='
}

export type AssignmentExpressionProps = {
  operator: AssignmentOperator,
  left: Identifier | MemberExpression,
  right: Identifier | Literal | CallExpression
};

export class AssignmentExpression extends JsNode<ast.AssignmentExpression> {

  props: AssignmentExpressionProps;
  constructor(props: AssignmentExpressionProps, children: GenericJsNode[]) {
    super();
    let operator = props.operator;
    this._node = <ast.AssignmentExpression>ast.builders["assignmentExpression"](operator, props.left.node(), props.right.node());
  }
}

/*========================================================================
                            Class Declaration
=========================================================================*/

export type ClassDeclarationProps = {
  id: string | Identifier,
  superClass?: string | Identifier
};

export class ClassDeclaration extends JsNode<ast.ClassDeclaration> {

  props: ClassDeclarationProps;
  constructor(props: ClassDeclarationProps, children: GenericJsNode[]) {
    super();
    let id = this.getId(props.id);
    let superClass = this.getSuperClass(props);
    let body = new ClassBody({}, []).node();
    this._node = <ast.ClassDeclaration>ast.builders["classDeclaration"](id, body, superClass);
  }

  private getId(value: string | Identifier): ast.Node {
    if (value.constructor.name === "String") {
      return new Identifier({ name: <string>value }).node();
    }
    return (value as Identifier).node();
  }

  private getSuperClass(props: ClassDeclarationProps): ast.Node {
    if (!props.superClass) {
      return null;
    }
    if (typeof(props.superClass) === "string") {
      return new Identifier({ name: <string>props.superClass }).node();
    }
    return (props.superClass as Identifier).node();
  }
}

/*========================================================================
                            Class Body
=========================================================================*/

export type ClassBodyProps = {

};

export class ClassBody extends JsNode<ast.ClassBody> {

  props: ClassBodyProps;
  constructor(props: ClassBodyProps, children: GenericJsNode[]) {
    super(<ast.ClassBody>ast.builders["classBody"]([]));
  }
}
