import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import * as ast from 'ast-types';

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
    this.initialise(b.variableDeclaration(kindString.toString(), declarators));
  }

  private getDeclarators(props: VariableDeclarationProps, children: GenericJsNode[]): ast.VariableDeclarator[] {
    let nodes: ast.VariableDeclarator[] = [];
    if (props.name) {
      nodes.push(new VariableDeclarator({ name: props.name }, children as JsNode<ast.Expression>[]).node());
      return nodes;
    }
    for (let child of children) {
      if (child.check(t.VariableDeclarator)) {
        nodes.push(child.node() as ast.VariableDeclarator);
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
  propTypes: {
    children: JsNode<ast.Expression>
  };

  constructor(props: VariableDeclaratorProps, children: JsNode<ast.Expression>[]) {
    super();
    let identifier = new Identifier({ name: props.name }).node();
    if (children.length > 1) {
      throw new Error("VariableDeclarator can only have one child");
    }
    let child = children.length ? children[0].node() : null;
    this.initialise(b.variableDeclarator(identifier, child));
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
    super(<ast.Literal>b.literal(props.value));
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
    super(<ast.Identifier>b.identifier(props.name));
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
    this.initialise(b.callExpression(callee, args));
  }

  private getArgs(children: GenericJsNode[]): ast.Expression[] {
    let args: ast.Expression[] = [];
    for (const child of children) {
      if (!(child instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (child.check<ast.Literal>(t.Literal)) {
        args.push(child.node());
      } else if (child.check<ast.Identifier>(t.Identifier)) {
        args.push(child.node());
      } else if (child.check<ast.CallExpression>(t.CallExpression)) {
        args.push(child.node());
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
    this.initialise(b.functionDeclaration(identifier, params, body));
  }

  private getParameters(children: GenericJsNode[]): ast.Pattern[] {
    let params: ast.Pattern[] = [];
    for (let child of children) {
      if (child.check<ast.Identifier>(t.Identifier)) {
        params.push(child.node());
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.BlockStatement {
    for (let child of children) {
      if (child.check<ast.BlockStatement>(t.BlockStatement)) {
        return child.node();
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
  constructor(props: BlockStatementProps, children: JsNode<ast.Statement>[]) {
    super();
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node());
    }
    this.initialise(b.blockStatement(statements));
  }
}

/*========================================================================
              Utility for Expression Statement and Return Statement
=========================================================================*/

function getSingleExpression(children: JsNode<ast.Expression>[],
  allowNull: boolean, statement: string): ast.Expression {

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
  constructor(props: ExpressionStatementProps, children: JsNode<ast.Expression>[]) {
    super(<ast.ExpressionStatement>b.expressionStatement(
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
  constructor(props: ReturnStatementProps, children: JsNode<ast.Expression>[]) {
    super(<ast.ReturnStatement>b.returnStatement(
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
    super(<ast.ThisExpression>b.thisExpression());
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
    this.initialise(b.memberExpression(object, props.property.node()));
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
    this.initialise(b.assignmentExpression(
      operator.toString(), props.left.node(), props.right.node()));
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
    this.initialise(b.classDeclaration(id, body, superClass));
  }

  private getId(value: string | Identifier): ast.Identifier {
    if (typeof(value) === "string") {
      return new Identifier({ name: value }).node();
    }
    return value.node();
  }

  private getSuperClass(props: ClassDeclarationProps): ast.Expression {
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
    super(<ast.ClassBody>b.classBody([]));
  }
}