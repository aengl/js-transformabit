import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import { JsCodeNode } from '../JsCode';
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

export class VariableDeclaration
  extends JsCodeNode<ast.VariableDeclaration, VariableDeclarationProps> {

  constructor(props: VariableDeclarationProps, children: GenericJsNode[]) {
    super(props);
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

export class VariableDeclarator
  extends JsCodeNode<ast.VariableDeclarator, VariableDeclaratorProps> {

  propTypes: {
    children: JsNode<ast.Expression>
  };

  constructor(props: VariableDeclaratorProps, children: JsNode<ast.Expression>[]) {
    super(props);
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

export class Literal extends JsCodeNode<ast.Literal, LiteralProps> {

  constructor(props: LiteralProps) {
    super(props);
    this.initialise(b.literal(props.value));
  }
}

/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = {
  name: string
};

export class Identifier extends JsCodeNode<ast.Identifier, IdentifierProps> {

  constructor(props: IdentifierProps) {
    super(props);
    this.initialise(b.identifier(props.name));
  }
}

/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  callee: Identifier | MemberExpression
};

export class CallExpression
  extends JsCodeNode<ast.CallExpression, CallExpressionProps> {

  constructor(props: CallExpressionProps, children: GenericJsNode[]) {
    super(props);
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

export class FunctionDeclaration
  extends JsCodeNode<ast.FunctionDeclaration, FunctionDeclarationProps> {

  constructor(props: FunctionDeclarationProps, children: GenericJsNode[]) {
    super(props);
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
                            Function Expression
=========================================================================*/

export type FunctionExpressionProps = {
  generator?: boolean,
  expression?: boolean,
  id?: Identifier | string
};

export class FunctionExpression extends JsNode<ast.FunctionExpression> {

  props: FunctionExpressionProps;
  constructor(props: FunctionExpressionProps, children: GenericJsNode[]) {
    super();

    let params = this.getParameters(children);
    let body = this.getBody(children);

    this.initialise(<ast.FunctionExpression>b.functionExpression(
      this.getId(props),
      params,
      body
    ));

  }

  private getId(props: FunctionExpressionProps): ast.Identifier {
    if (props === null) {
      return null;
    }
    if (!props.id) {
      return null;
    } else if (props.id.constructor.name === "Identifier") {
      return (props.id as Identifier).node();
    } else {
      return new Identifier({name: <string>props.id}).node();
    }
  }

  private isExpression(props: FunctionExpressionProps): boolean {
    if (props === null) {
      return false;
    }
    return typeof props.expression !== "undefined";
  }

  private isGenerator(props: FunctionExpressionProps): boolean {
    if (props === null) {
      return false;
    }
    return typeof props.generator !== "undefined";
  }

  private getParameters(children: GenericJsNode[]): ast.Pattern[] {
    let params = Array<ast.Pattern>();
    for (let index in children) {
      if (children[index].check(ast.namedTypes.Identifier)) {
        params.push(children[index].node() as ast.Pattern);
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.BlockStatement {
    for (let index in children) {
      if (children[index].check(ast.namedTypes.BlockStatement)) {
        return children[index].node() as ast.BlockStatement;
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

export class BlockStatement extends JsCodeNode<ast.BlockStatement, BlockStatementProps> {

  constructor(props: BlockStatementProps, children: JsNode<ast.Statement>[]) {
    super(props);
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node());
    }
    this.initialise(b.blockStatement(statements));
  }
}


/*========================================================================
                            Property
=========================================================================*/

export enum PropertyKind {
  Init = <any>'init',
  Get = <any>'get',
  Set = <any>'set'
}

export type PropertyProps = {
  key: string | Identifier,
  value?: FunctionExpression | Literal,
  kind: PropertyKind,
  method?: boolean,
  shorthand?: boolean,
  computed?: boolean
}

export class Property extends JsNode<ast.Property> {

  props: PropertyProps;
  constructor(props: PropertyProps, children: GenericJsNode[]) {
    super();

    let key = this.getKey(props);
    let kind = props.kind.toString() as 'init' | 'get' | 'set';

    this.initialise(<ast.Property>b.property(
      kind,
      key,
      this.getValue(props, children) as ast.Identifier | ast.FunctionExpression | ast.ArrowFunctionExpression | ast.Literal
    ));

  }


  private getValue(props: PropertyProps, children: GenericJsNode[]): ast.Node {
    if (props.value) {
      return (props.value as GenericJsNode).node();
    }
    if (children.length < 1) {
      throw new Error("Must supplu value in either props or as a child");
    } else {
      return (children[0] as GenericJsNode).node();
    }
  }

  private getKey(props: PropertyProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier({name: <string>props.key}).node();
    } else {
      return (props.key as Identifier).node();
    }
  }
}


/*========================================================================
                            Object Expression
=========================================================================*/

export type ObjectExpressionProps = {

}

export class ObjectExpression extends JsNode<ast.ObjectExpression> {

  props: ObjectExpressionProps;
  constructor(props: ObjectExpressionProps, children: GenericJsNode[]) {
    super();
    this.initialise(<ast.ObjectExpression>b.objectExpression(
      this.getProperties(children)
    ));
  }

  private getProperties(children: GenericJsNode[]): ast.Property[] {
    let nodes = Array<ast.Property>();
    for (let jsnode of children) {
      if (jsnode.constructor.name !== "Property") {
        throw new Error("Children of Object Expression must be all of Property");
      }
      nodes.push(jsnode.node() as ast.Property);
    }
    return nodes;
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
    case "AssignmentExpression":
      return children[0].node();
    default:
      throw new Error("The expression in an " + statement + " must be either an Identifier, CallExpression, AssignmentExpression, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = {
};

export class ExpressionStatement
  extends JsCodeNode<ast.ExpressionStatement, ExpressionStatementProps> {

  constructor(props: ExpressionStatementProps, children: JsNode<ast.Expression>[]) {
    super(props);
    this.initialise(b.expressionStatement(
      getSingleExpression(children, false, t.ExpressionStatement.toString())));
  }

}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

export class ReturnStatement extends JsCodeNode<ast.ReturnStatement, ReturnStatementProps> {

  constructor(props: ReturnStatementProps, children: JsNode<ast.Expression>[]) {
    super(props);
    this.initialise(<ast.ReturnStatement>b.returnStatement(
      getSingleExpression(children, true, t.ReturnStatement.toString())));
  }
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = {
};

export class ThisExpression extends JsCodeNode<ast.ThisExpression, ThisExpressionProps> {

  constructor(props: ThisExpressionProps, children: GenericJsNode[]) {
    super(props);
    this.initialise(b.thisExpression());
  }
}

/*========================================================================
                            Member Expression
=========================================================================*/

export type MemberExpressionProps = {
  object?: ThisExpression | MemberExpression | Identifier | string,
  property: Identifier | string
};

export class MemberExpression
  extends JsCodeNode<ast.MemberExpression, MemberExpressionProps> {

  constructor(props: MemberExpressionProps, children: GenericJsNode[]) {
    super(props);
    let object: ast.Node;
    let property = this.getAsNode(props.property);
    if (!props.object) {
      object = new ThisExpression({}, []).node();
    } else {
      object = this.getAsNode(props.object);
    }

    this.initialise(<ast.MemberExpression>b.memberExpression(object, property));
  }

  private getAsNode(item: ThisExpression | MemberExpression | Identifier | string): ast.Expression {
    if (item.constructor.name == "String") {
      return new Identifier({name: <string>item}).node();
    }

    return (item as GenericJsNode).node() as ast.Expression;

   // this.initialise(b.memberExpression(object, props.property.node()));

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
  right: Identifier | Literal | CallExpression | NewExpression
};

export class AssignmentExpression
  extends JsCodeNode<ast.AssignmentExpression, AssignmentExpressionProps> {

  constructor(props: AssignmentExpressionProps, children: GenericJsNode[]) {
    super(props);
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
  superClass?: string | Identifier | MemberExpression
};

export class ClassDeclaration extends JsCodeNode<ast.ClassDeclaration, ClassDeclarationProps> {

  constructor(props: ClassDeclarationProps, children: GenericJsNode[]) {
    super(props);
    let id = this.getId(props.id);
    let superClass = this.getSuperClass(props);

    let body = new ClassBody({}, children).node();
    this.initialise (<ast.ClassDeclaration>b.classDeclaration(id, body, superClass));

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

export class ClassBody extends JsCodeNode<ast.ClassBody, ClassBodyProps> {

  constructor(props: ClassBodyProps, children: GenericJsNode[]) {
    super(props);
    this.initialise(<ast.ClassBody>b.classBody(this.asNodeArray(children)));
  }

  private asNodeArray(children: GenericJsNode[]): ast.ClassBodyElement[] {
    if (children.length < 1) {
      return [];
    }
    let nodes = Array<ast.ClassBodyElement>();
    for (let n of children) {
      nodes.push(n.node() as ast.ClassBodyElement);
    }
    return nodes;
  }
}

/*========================================================================
                            Method Definition
=========================================================================*/

export enum MethodKind {
  Method = <any>'method',
  Get = <any>'get',
  Set = <any>'set',
  Constructor = <any>'constructor'
}

export type MethodDefinitionProps = {
  key: Identifier | string,
  kind: MethodKind,
  computed?: boolean,
  staticMethod?: boolean,
  expression?: FunctionExpression
}

export class MethodDefinition extends JsNode<ast.MethodDefinition> {

  props: MethodDefinitionProps;
  constructor(props: MethodDefinitionProps, children: GenericJsNode[]) {
    super();
    let kindString = (props.kind.toString() as 'set' | 'constructor' | 'get' | 'method');
    this.initialise(<ast.MethodDefinition>b.methodDefinition(
      kindString,
      this.getKey(props),
      this.getFunction(props, children),
      this.getBool(props.staticMethod)
    ));
  }

  private getBool(val?: boolean): boolean {
    if (typeof val === "undefined") {
      return false;
    }
    return val;
  }

  private getKey(props: MethodDefinitionProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier({name: <string>props.key}).node();
    }
    return (props.key as Identifier).node();
  }

  private getFunction(props: MethodDefinitionProps, children: GenericJsNode[]): ast.Function {
    if (props.expression) {
      return props.expression.node();
    }
    if (children.length === 0) {
      return new FunctionExpression({}, []).node();
    }
    return (children[0] as FunctionExpression).node();
  }
}

/*========================================================================
                            New Expression
=========================================================================*/
export type NewExpressionProps = {
  callee: Identifier | MemberExpression
}

export class NewExpression extends JsNode<ast.NewExpression> {

  props: NewExpressionProps;
  constructor(props: NewExpressionProps, children: GenericJsNode[]) {
    super();
    this.initialise(
      <ast.NewExpression>ast.builders["newExpression"](props.callee.node(), this.getArgs(children))
    );

  }

  private getArgs(children: GenericJsNode[]): ast.Node[] {
    const nodes = new Array<ast.Node>();
    for (const child of children) {
      nodes.push(child.node());
    }
    return nodes;
  }
}