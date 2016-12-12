import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import * as ast from 'ast-types';

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = {
};

export class Expression extends JsNode<ast.Expression, ExpressionProps> {
  build(props: ExpressionProps): Expression {
    return super.build(props);
  }
}

/*========================================================================
                                Statement
=========================================================================*/

export type StatementProps = {
};

export class Statement extends JsNode<ast.Statement, StatementProps> {
  build(props: StatementProps): Statement {
    return super.build(props);
  }
}

/*========================================================================
                                Statement
=========================================================================*/

export type MethodDefinitionProps = {
};

export class MethodDefinition extends JsNode<ast.MethodDefinition, MethodDefinitionProps> {
  build(props: StatementProps): MethodDefinition {
    return super.build(props) as MethodDefinition;
  }

  methodName(): string {
    return this.findFirstChildOfType(Identifier).name;
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

export class VariableDeclaration
  extends JsNode<ast.VariableDeclaration, VariableDeclarationProps> {

  build(props: VariableDeclarationProps,
    children: GenericJsNode[] = []): VariableDeclaration {

    let kindString = props.kind || VariableKind.Var;
    let declarators = this.getDeclarators(props, children);
    this.node = b.variableDeclaration(kindString.toString(), declarators);
    return super.build(props) as VariableDeclaration;
  }

  private getDeclarators(props: VariableDeclarationProps,
    children: GenericJsNode[]): ast.VariableDeclarator[] {

    let nodes: ast.VariableDeclarator[] = [];
    if (props.name) {
      let declarator = new VariableDeclarator().build({ name: props.name });
      declarator.build({ name: props.name }, children as Expression[]);
      nodes.push(declarator.node);
      return nodes;
    }
    for (let child of children) {
      if (child.check(t.VariableDeclarator)) {
        nodes.push(child.node as ast.VariableDeclarator);
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

export class VariableDeclarator
  extends JsNode<ast.VariableDeclarator, VariableDeclaratorProps> {

  propTypes: {
    children: Expression
  };

  build(props: VariableDeclaratorProps, children: Expression[] = []): VariableDeclarator {
    let identifier = new Identifier().build({ name: props.name }).node;
    if (children.length > 1) {
      throw new Error("VariableDeclarator can only have one child");
    }
    let child = children.length ? children[0].node : null;
    this.node = b.variableDeclarator(identifier, child);
    return super.build(props) as VariableDeclarator;
  }
}

/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = {
  value: string | number | boolean | null
};

export class Literal extends JsNode<ast.Literal, LiteralProps> {
  build(props: LiteralProps): Literal {
    this.node = b.literal(props.value);
    return super.build(props);
  }
}

/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = {
  name: string
};

export class Identifier extends JsNode<ast.Identifier, IdentifierProps> {
  get name(): string {
    return this._node.name;
  }

  set name(value: string) {
    this._node.name = value;
  }

  build(props: IdentifierProps): Identifier {
    this.node = b.identifier(props.name);
    return super.build(props) as Identifier;
  }
}

/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  callee: string | Identifier | MemberExpression
};

export class CallExpression
  extends JsNode<ast.CallExpression, CallExpressionProps> {

  build(props: CallExpressionProps, children: GenericJsNode[] = []): CallExpression {
    let callee: ast.Identifier | ast.MemberExpression =
      (typeof props.callee === 'string') ?
        b.identifier(props.callee) : props.callee.node;
    let args = this.getArgs(children);
    this.node = b.callExpression(callee, args);
    return super.build(props) as CallExpression;
  }

  private getArgs(children: GenericJsNode[]): ast.Expression[] {
    let args: ast.Expression[] = [];
    for (const child of children) {
      if (!(child instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (child.check<ast.Literal>(t.Literal)) {
        args.push(child.node);
      } else if (child.check<ast.Identifier>(t.Identifier)) {
        args.push(child.node);
      } else if (child.check<ast.CallExpression>(t.CallExpression)) {
        args.push(child.node);
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

export class FunctionDeclaration
  extends JsNode<ast.FunctionDeclaration, FunctionDeclarationProps> {

  build(props: FunctionDeclarationProps, children: GenericJsNode[]): FunctionDeclaration {
    let identifier = new Identifier().build({ name: props.name }).node;
    let params = this.getParameters(children);
    let body = this.getBody(children);
    this.node = b.functionDeclaration(identifier, params, body);
    return super.build(props) as FunctionDeclaration;
  }

  private getParameters(children: GenericJsNode[]): ast.Pattern[] {
    let params: ast.Pattern[] = [];
    for (let child of children) {
      if (child.check<ast.Identifier>(t.Identifier)) {
        params.push(child.node);
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.BlockStatement {
    for (let child of children) {
      if (child.check<ast.BlockStatement>(t.BlockStatement)) {
        return child.node;
      }
    }
    return b.blockStatement([]);
  }
}

/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {
};

export class BlockStatement extends JsNode<ast.BlockStatement, BlockStatementProps> {
  build(props: BlockStatementProps, children: Statement[]): BlockStatement {
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node);
    }
    this.node = b.blockStatement(statements);
    return super.build(props);
  }
}

/*========================================================================
              Utility for Expression Statement and Return Statement
=========================================================================*/

function getSingleExpression(children: Expression[],
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
      return children[0].node;
    default:
      throw new Error("The expression in an " + statement + " must be either an Identifier, CallExpression, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = {
};

export class ExpressionStatement
  extends JsNode<ast.ExpressionStatement, ExpressionStatementProps> {

  build(props: ExpressionStatementProps, children: Expression[]): ExpressionStatement {
    this.node = b.expressionStatement(
      getSingleExpression(children, false, t.ExpressionStatement.toString()));
    return super.build(props);
  }
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {
  build(props: ReturnStatementProps, children: Expression[]): ReturnStatement {
    this.node = <ast.ReturnStatement>b.returnStatement(
      getSingleExpression(children, true, t.ReturnStatement.toString()));
    return super.build(props);
  }
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = {
};

export class ThisExpression extends JsNode<ast.ThisExpression, ThisExpressionProps> {
  build(props: ThisExpressionProps, children: GenericJsNode[]): ThisExpression {
    this.node = b.thisExpression();
    return super.build(props);
  }
}

/*========================================================================
                            Member Expression
=========================================================================*/

export type MemberExpressionProps = {
  object?: ThisExpression | MemberExpression,
  property: string | Identifier
};

export class MemberExpression
  extends JsNode<ast.MemberExpression, MemberExpressionProps> {

  build(props: MemberExpressionProps, children: GenericJsNode[]): MemberExpression {
    let object: ast.Node;
    if (!props.object) {
      object = b.thisExpression();
    } else {
      object = props.object.node;
    }
    let property: ast.Identifier = (typeof props.property === 'string') ?
      b.identifier(props.property) : props.property.node;
    this.node = b.memberExpression(object, property);
    return super.build(props);
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

export class AssignmentExpression
  extends JsNode<ast.AssignmentExpression, AssignmentExpressionProps> {

  build(props: AssignmentExpressionProps, children: GenericJsNode[]): AssignmentExpression {
    let operator = props.operator;
    this.node = b.assignmentExpression(
      operator.toString(), props.left.node, props.right.node);
    return super.build(props);
  }
}

/*========================================================================
                            Class Declaration
=========================================================================*/

export type ClassDeclarationProps = {
  id: string | Identifier,
  superClass?: string | Identifier
};

export class ClassDeclaration
  extends JsNode<ast.ClassDeclaration, ClassDeclarationProps> {

  build(props: ClassDeclarationProps, children: GenericJsNode[]): ClassDeclaration {
    let id = this.getId(props.id);
    let superClass = this.getSuperClass(props);
    this.node = b.classDeclaration(id, b.classBody([]), superClass);
    return super.build(props) as ClassDeclaration;
  }

  private getId(value: string | Identifier): ast.Identifier {
    if (typeof(value) === "string") {
      return new Identifier().build({ name: value }).node;
    }
    return value.node;
  }

  private getSuperClass(props: ClassDeclarationProps): ast.Expression {
    if (!props.superClass) {
      return null;
    }
    if (typeof(props.superClass) === "string") {
      return new Identifier().build({ name: <string>props.superClass }).node;
    }
    return (props.superClass as Identifier).node;
  }
}

/*========================================================================
                            Class Body
=========================================================================*/

export type ClassBodyProps = {
};

export class ClassBody extends JsNode<ast.ClassBody, ClassBodyProps> {
  build(props: ClassBodyProps, children: GenericJsNode[]): ClassBody {
    this.node = b.classBody([]);
    return super.build(props);
  }
}
