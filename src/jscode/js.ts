import {
  JsNode,
  JsNodeFactory,
  GenericJsNode
} from '../JsNode';
import * as ast from 'ast-types';

const b = ast.builders;

/*========================================================================
                                  File
=========================================================================*/

export type FileProps = {
};

@JsNodeFactory.registerType
export class File extends JsNode<ast.File, FileProps> {
  build(props: FileProps): File {
    return super.build(props);
  }
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = {
};

@JsNodeFactory.registerType
export class Program extends JsNode<ast.Program, ProgramProps> {
  build(props: ProgramProps): Program {
    return super.build(props);
  }
}

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = {
};

@JsNodeFactory.registerType
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

@JsNodeFactory.registerType
export class Statement extends JsNode<ast.Statement, StatementProps> {
  build(props: StatementProps): Statement {
    return super.build(props);
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

@JsNodeFactory.registerType
export class VariableDeclaration
  extends JsNode<ast.VariableDeclaration, VariableDeclarationProps> {

  build(props: VariableDeclarationProps,
    children: GenericJsNode[] = []): VariableDeclaration {

    let kindString = props.kind || VariableKind.Var;
    let declarators = this.getDeclarators(props, children);
    this.node = b.variableDeclaration(kindString.toString(), declarators);
    return super.build(props, children) as VariableDeclaration;
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
      if (child.check(VariableDeclarator)) {
        nodes.push(child.node);
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

@JsNodeFactory.registerType
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
    return super.build(props, children) as VariableDeclarator;
  }
}

/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = {
  value: string | number | boolean | null
};

@JsNodeFactory.registerType
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

@JsNodeFactory.registerType
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

@JsNodeFactory.registerType
export class CallExpression
  extends JsNode<ast.CallExpression, CallExpressionProps> {

  build(props: CallExpressionProps, children: GenericJsNode[] = []): CallExpression {
    let callee: ast.Identifier | ast.MemberExpression =
      (typeof props.callee === 'string') ?
        b.identifier(props.callee) : props.callee.node;
    let args = this.getArgs(children);
    this.node = b.callExpression(callee, args);
    return super.build(props, children) as CallExpression;
  }

  private getArgs(children: GenericJsNode[]): ast.Expression[] {
    let args: ast.Expression[] = [];
    for (const child of children) {
      if (!(child instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (child.check(Literal) || child.check(Identifier) || child.check(CallExpression)) {
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

@JsNodeFactory.registerType
export class FunctionDeclaration
  extends JsNode<ast.FunctionDeclaration, FunctionDeclarationProps> {

  build(props: FunctionDeclarationProps, children: GenericJsNode[]): FunctionDeclaration {
    let identifier = new Identifier().build({ name: props.name }).node;
    let params = this.getParameters(children);
    let body = this.getBody(children);
    this.node = b.functionDeclaration(identifier, params, body);
    return super.build(props, children) as FunctionDeclaration;
  }

  private getParameters(children: GenericJsNode[]): ast.Pattern[] {
    let params: ast.Pattern[] = [];
    for (let child of children) {
      if (child.check(Identifier)) {
        params.push(child.node);
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.BlockStatement {
    for (let child of children) {
      if (child.check(BlockStatement)) {
        return child.node;
      }
    }
    return b.blockStatement([]);
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

@JsNodeFactory.registerType
export class FunctionExpression
  extends JsNode<ast.FunctionExpression, FunctionExpressionProps> {

  props: FunctionExpressionProps;

  build(props: FunctionExpressionProps, children: GenericJsNode[]): FunctionExpression {
    this.node = b.functionExpression(
      this.getId(props),
      this.getParameters(children),
      this.getBody(children)
    );
    return super.build(props, children) as FunctionExpression;
  }

  isExpression(props: FunctionExpressionProps): boolean {
    if (props === null) {
      return false;
    }
    return typeof props.expression !== "undefined";
  }

  isGenerator(props: FunctionExpressionProps): boolean {
    if (props === null) {
      return false;
    }
    return typeof props.generator !== "undefined";
  }

  private getId(props: FunctionExpressionProps): ast.Identifier {
    if (props === null) {
      return null;
    }
    if (!props.id) {
      return null;
    } else if (props.id.constructor.name === "Identifier") {
      return (props.id as Identifier).node;
    } else {
      return new Identifier({name: <string>props.id}).node;
    }
  }

  private getParameters(children: GenericJsNode[]): ast.Pattern[] {
    let params = Array<ast.Pattern>();
    for (let index in children) {
      if (children[index].check(Identifier)) {
        params.push(children[index].node as ast.Pattern);
      }
    }
    return params;
  }

  private getBody(children: GenericJsNode[]): ast.BlockStatement {
    for (let index in children) {
      if (children[index].check(BlockStatement)) {
        return children[index].node as ast.BlockStatement;
      }
    }
    return new BlockStatement({}, []).node;
  }
}

/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {
};

@JsNodeFactory.registerType
export class BlockStatement extends JsNode<ast.BlockStatement, BlockStatementProps> {
  build(props: BlockStatementProps, children: Statement[]): BlockStatement {
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node);
    }
    this.node = b.blockStatement(statements);
    return super.build(props, children);
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
};

@JsNodeFactory.registerType
export class Property extends JsNode<ast.Property, PropertyProps> {
  props: PropertyProps;

  build(props: PropertyProps, children: GenericJsNode[]): Property {
    let key = this.getKey(props);
    let kind = props.kind.toString() as 'init' | 'get' | 'set';

    this.node = b.property(
      kind,
      key,
      this.getValue(props, children) as ast.Identifier |
        ast.FunctionExpression | ast.ArrowFunctionExpression | ast.Literal
    );
    return super.build(props, children) as Property;
  }

  private getValue(props: PropertyProps, children: GenericJsNode[]): ast.Node {
    if (props.value) {
      return (props.value as GenericJsNode).node;
    }
    if (children.length < 1) {
      throw new Error("Must supplu value in either props or as a child");
    } else {
      return (children[0] as GenericJsNode).node;
    }
  }

  private getKey(props: PropertyProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier({name: <string>props.key}).node;
    } else {
      return (props.key as Identifier).node;
    }
  }
}

/*========================================================================
                            Object Expression
=========================================================================*/

export type ObjectExpressionProps = {
};

@JsNodeFactory.registerType
export class ObjectExpression
  extends JsNode<ast.ObjectExpression, ObjectExpressionProps> {

  props: ObjectExpressionProps;

  build(props: ObjectExpressionProps, children: GenericJsNode[]): ObjectExpression {
    this.node = b.objectExpression(this.getProperties(children));
    return super.build(props, children) as ObjectExpression;
  }

  private getProperties(children: GenericJsNode[]): ast.Property[] {
    let nodes = Array<ast.Property>();
    for (let jsnode of children) {
      if (jsnode.constructor.name !== "Property") {
        throw new Error("Children of Object Expression must be all of Property");
      }
      nodes.push(jsnode.node as ast.Property);
    }
    return nodes;
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
    case "AssignmentExpression":
      return children[0].node;
    default:
      throw new Error("The expression in an " + statement +
        " must be either an Identifier, CallExpression, AssignmentExpression, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = {
};

@JsNodeFactory.registerType
export class ExpressionStatement
  extends JsNode<ast.ExpressionStatement, ExpressionStatementProps> {

  build(props: ExpressionStatementProps, children: Expression[]): ExpressionStatement {
    this.node = b.expressionStatement(
      getSingleExpression(children, false, ExpressionStatement.name));
    return super.build(props, children);
  }
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

@JsNodeFactory.registerType
export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {
  build(props: ReturnStatementProps, children: Expression[]): ReturnStatement {
    this.node = <ast.ReturnStatement>b.returnStatement(
      getSingleExpression(children, true, ReturnStatement.name));
    return super.build(props, children);
  }
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = {
};

@JsNodeFactory.registerType
export class ThisExpression extends JsNode<ast.ThisExpression, ThisExpressionProps> {
  build(props: ThisExpressionProps, children: GenericJsNode[]): ThisExpression {
    this.node = b.thisExpression();
    return super.build(props, children);
  }
}

/*========================================================================
                            Member Expression
=========================================================================*/

export type MemberExpressionProps = {
  object?: ThisExpression | MemberExpression | Identifier | string,
  property: Identifier | string
};

@JsNodeFactory.registerType
export class MemberExpression
  extends JsNode<ast.MemberExpression, MemberExpressionProps> {

  build(props: MemberExpressionProps, children: GenericJsNode[]): MemberExpression {
    let object: ast.Node;
    if (!props.object) {
      object = b.thisExpression();
    } else {
      object = (typeof props.object === 'string') ?
        b.identifier(props.object) : props.object.node;
    }
    let property: ast.Identifier = (typeof props.property === 'string') ?
      b.identifier(props.property) : props.property.node;
    this.node = b.memberExpression(object, property);
    return super.build(props, children);
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

@JsNodeFactory.registerType
export class AssignmentExpression
  extends JsNode<ast.AssignmentExpression, AssignmentExpressionProps> {

  build(props: AssignmentExpressionProps, children: GenericJsNode[]): AssignmentExpression {
    let operator = props.operator;
    this.node = b.assignmentExpression(
      operator.toString(), props.left.node, props.right.node);
    return super.build(props, children);
  }
}

/*========================================================================
                            Class Declaration
=========================================================================*/

export type ClassDeclarationProps = {
  id: string | Identifier,
  superClass?: string | Identifier | MemberExpression
};

@JsNodeFactory.registerType
export class ClassDeclaration
  extends JsNode<ast.ClassDeclaration, ClassDeclarationProps> {

  build(props: ClassDeclarationProps, children: GenericJsNode[]): ClassDeclaration {
    this.node = b.classDeclaration(
      this.getId(props.id),
      new ClassBody().build({}, children).node,
      this.getSuperClass(props)
    );
    return super.build(props, children) as ClassDeclaration;
  }

  private getId(value: string | Identifier): ast.Identifier {
    if (typeof(value) === 'string') {
      return new Identifier().build({ name: value }).node;
    }
    return value.node;
  }

  private getSuperClass(props: ClassDeclarationProps): ast.Expression {
    if (!props.superClass) {
      return null;
    }
    if (typeof(props.superClass) === 'string') {
      return new Identifier().build({ name: props.superClass }).node;
    }
    return (props.superClass as Identifier).node;
  }
}

/*========================================================================
                            Class Body
=========================================================================*/

export type ClassBodyProps = {
};

@JsNodeFactory.registerType
export class ClassBody extends JsNode<ast.ClassBody, ClassBodyProps> {
  build(props: ClassBodyProps, children: GenericJsNode[]): ClassBody {
    this.node = b.classBody(this.asNodeArray(children));
    return super.build(props, children) as ClassBody;
  }

  private asNodeArray(children: GenericJsNode[]): ast.ClassBodyElement[] {
    if (children.length < 1) {
      return [];
    }
    let nodes = Array<ast.ClassBodyElement>();
    for (let n of children) {
      nodes.push(n.node as ast.ClassBodyElement);
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
};

@JsNodeFactory.registerType
export class MethodDefinition
  extends JsNode<ast.MethodDefinition, MethodDefinitionProps> {

  props: MethodDefinitionProps;

  build(props: MethodDefinitionProps, children: GenericJsNode[]): MethodDefinition {
    let kindString = (props.kind.toString() as 'set' | 'constructor' | 'get' | 'method');
    this.node = b.methodDefinition(
      kindString,
      this.getKey(props),
      this.getFunction(props, children),
      this.getBool(props.staticMethod)
    );
    return super.build(props, children) as MethodDefinition;
  }

  methodName() {
    return this.findFirstChildOfType(Identifier).name;
  }

  private getBool(val?: boolean): boolean {
    if (typeof val === "undefined") {
      return false;
    }
    return val;
  }

  private getKey(props: MethodDefinitionProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier({name: <string>props.key}).node;
    }
    return (props.key as Identifier).node;
  }

  private getFunction(props: MethodDefinitionProps,
    children: GenericJsNode[]): ast.Function {

    if (props.expression) {
      return props.expression.node;
    }
    if (children.length === 0) {
      return new FunctionExpression({}, []).node;
    }
    return (children[0] as FunctionExpression).node;
  }
}

/*========================================================================
                            New Expression
=========================================================================*/

export type NewExpressionChild = (ast.Expression | ast.SpreadElement);

export type NewExpressionProps = {
  callee: Identifier | MemberExpression
};

@JsNodeFactory.registerType
export class NewExpression extends JsNode<ast.NewExpression, NewExpressionProps> {
  props: NewExpressionProps;

  build(props: NewExpressionProps,
    children: JsNode<NewExpressionChild, any>[]): NewExpression {

    this.node = ast.builders.newExpression(props.callee.node, this.getArgs(children));
    return super.build(props, children) as NewExpression;
  }

  private getArgs(children: JsNode<NewExpressionChild, any>[]): NewExpressionChild[] {
    const nodes: NewExpressionChild[] = [];
    for (const child of children) {
      nodes.push(child.node);
    }
    return nodes;
  }
}
