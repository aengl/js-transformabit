import {
  JsNode,
  JsNodeFactory,
  JsContainerNode,
  JsNodeList,
  GenericJsNode
} from '../JsNode';
import { ast } from '../../deps/bundle';

const b = ast.builders;

/*========================================================================
                                  File
=========================================================================*/

export type FileProps = {
};

@JsNodeFactory.registerType
export class File extends JsNode<ast.File, FileProps> {
  build(props: FileProps, children: any[]): this {
    return this;
  }
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = {
};

@JsNodeFactory.registerType
export class Program extends JsContainerNode<ast.Program, ProgramProps, GenericStatement> {

  build(props: ProgramProps, children: any[]): this {
    this.node = b.program(this.nodeArray(children, []));
    return this;
  }

  private nodeArray(children: any[], array: any[]): any[] {
    for (const child of children) {
      if (Array.isArray(child)) {
        array = this.nodeArray(child, array);
      } else {
        array.push(child.node);
      }
    }
    return array;
  }
}

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = {
};

@JsNodeFactory.registerType
export class Expression<T extends ast.Expression, P extends ExpressionProps>
  extends JsNode<T, P> {}

export type GenericExpression = Expression<ast.Expression, ExpressionProps>;

/*========================================================================
                                Statement
=========================================================================*/

export type StatementProps = {
};

@JsNodeFactory.registerType
export class Statement<T extends ast.Statement, P extends StatementProps>
  extends JsNode<T, P> {}

export type GenericStatement = Statement<ast.Statement, StatementProps>;

/*========================================================================
                            Variable Declaration
=========================================================================*/

export type VariableDeclarationProps = {
  name?: string,
  kind?: ast.VariableKind
};

@JsNodeFactory.registerType
export class VariableDeclaration<T extends ast.VariableDeclaration, P extends VariableDeclarationProps>
  extends Statement<T, P> {

  build(props: P, children: any[]): this {
    let declarators = this.getDeclarators(props, children);
    this.node = <T>b.variableDeclaration(props.kind || 'var', declarators);
    return this;
  }

  declarations() {
    return this.getNodesForProp('declarations', VariableDeclarator);
  }

  private getDeclarators(props: VariableDeclarationProps,
    children: any[]): ast.VariableDeclarator[] {

    let nodes: ast.VariableDeclarator[] = [];
    if (props.name) {
      let declarator = new VariableDeclarator().build({ name: props.name });
      declarator.build({ name: props.name }, children as GenericExpression[]);
      nodes.push(declarator.node);
      return nodes;
    }
    for (let child of children) {
      if (child instanceof VariableDeclarator) {
        nodes.push(child.node);
      }
    }
    return nodes;
  }
}

export type GenericVariableDeclaration =
  VariableDeclaration<ast.VariableDeclaration, VariableDeclarationProps>;

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
    children: GenericExpression
  };

  get name(): string {
    return this.id().name;
  }

  set name(value: string) {
    this.id().name = value;
  }

  id(): Identifier {
    return this.getNodeForProp<Identifier>('id');
  }

  init(): GenericExpression {
    return this.getNodeForProp<GenericExpression>('init');
  }

  build(props: VariableDeclaratorProps, children: GenericExpression[] = []): this {
    let identifier = b.identifier(props.name);
    if (children.length > 1) {
      throw new Error("VariableDeclarator can only have one child");
    }
    let child = children.length ? children[0].node : null;
    this.node = b.variableDeclarator(identifier, child);
    return this;
  }
}

/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = {
  value: ast.LiteralValue
};

@JsNodeFactory.registerType
export class Literal extends JsNode<ast.Literal, LiteralProps> {
  static fromValue(value: any) {
    return new Literal().build({ value: value }, []);
  }

  get value(): ast.LiteralValue {
    return this.node.value;
  }

  set value(value: ast.LiteralValue) {
    this.node.value = value;
  }

  build(props: LiteralProps, children: any[]): this {
    this.node = b.literal(props.value);
    return this;
  }
}

/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = ExpressionProps & {
  name: string
};

@JsNodeFactory.registerType
export class Identifier extends Expression<ast.Identifier, IdentifierProps> {
  static fromName(name: string) {
    return new Identifier().build({ name: name }, []);
  }

  get name(): string {
    return this.node.name;
  }

  set name(value: string) {
    this.node.name = value;
  }

  build(props: IdentifierProps, children: any[]): this {
    this.node = b.identifier(props.name);
    return this;
  }
}

/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  callee: string | Identifier | MemberExpression | CallExpression
};

@JsNodeFactory.registerType
export class CallExpression
  extends Expression<ast.CallExpression, CallExpressionProps> {

  build(props: CallExpressionProps, children: any[] = []): this {
    let args = this.getArgs(children);
    this.node = b.callExpression(this.getNodeOrFallback(props.callee, b.identifier), args);
    return this;
  }

  callee() {
    return this.getNodeForProp('callee');
  }

  private getArgs(children: any[]): ast.Expression[] {
    let args: ast.Expression[] = [];
    for (const child of children) {
      if (!(child instanceof JsNode)) {
        throw new Error("All Children must be of JsNode, if you are trying to pass in a variable that is a JsNode, write {variableNameHere}");
      }
      if (child instanceof Literal ||
        child instanceof Identifier ||
        child instanceof FunctionExpression ||
        child instanceof Expression) {
        args.push(child.node);
      } else {
        throw new Error("argument if specified must be either a Literal, Identifier, or an Expression");
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
  extends JsContainerNode<ast.FunctionDeclaration, FunctionDeclarationProps, GenericStatement> {

  build(props: FunctionDeclarationProps, children: any[]): this {
    let identifier = b.identifier(props.name);
    let params = this.getParameters(children);
    let body = this.getBody(children);
    this.node = b.functionDeclaration(identifier, params, body);
    return this;
  }

  protected getChildNodes() {
    if (this.node.body === null) {
      this.node.body = b.blockStatement([]);
    }
    return this.node.body.body;
  }

  private getParameters(children: any[]): ast.Pattern[] {
    let params: ast.Pattern[] = [];
    for (let child of children) {
      if (child instanceof Identifier) {
        params.push(child.node);
      }
    }
    return params;
  }

  private getOrCreateBlock(): GenericBlockStatement {
    if (this.node.body === null) {
      this.node.body = b.blockStatement([]);
    }
    return this.getNodeForProp<GenericBlockStatement>("body");
  }

  private getBody(children: any[]): ast.BlockStatement {
    for (let child of children) {
      if (child instanceof BlockStatement) {
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
  extends Expression<ast.FunctionExpression, FunctionExpressionProps> {

  build(props: FunctionExpressionProps, children: any[]): this {
    this.node = b.functionExpression(
      this.getId(props),
      this.getParameters(children),
      this.getBody(children)
    );
    return this;
  }

  params() {
    return this.getNodesForProp<Pattern>('params');
  }

  body() {
    return this.getNodeForProp<GenericBlockStatement | GenericExpression>('body');
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
    } else if (props.id === 'string') {
      return new Identifier().build({ name: props.id }, []).node;
    } else {
      return (props.id as Identifier).node;
    }
  }

  private getParameters(children: any[]): ast.Pattern[] {
    let params = Array<ast.Pattern>();
    for (let index in children) {
      if (children[index] instanceof Identifier) {
        params.push(children[index].node as ast.Pattern);
      }
    }
    return params;
  }

  private getBody(children: any[]): ast.BlockStatement {
    for (let index in children) {
      if (children[index] instanceof BlockStatement) {
        return children[index].node as ast.BlockStatement;
      }
    }
    return new BlockStatement().build({}, []).node;
  }
}

/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {
};

@JsNodeFactory.registerType
export class BlockStatement<T extends ast.BlockStatement, P extends BlockStatementProps>
  extends JsContainerNode<T, P, GenericStatement> {

  build(props: BlockStatementProps, children: GenericStatement[]): this {
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node);
    }
    this.node = <T>b.blockStatement(statements);
    return this;
  }
}

export type GenericBlockStatement = BlockStatement<ast.BlockStatement, BlockStatementProps>;

/*========================================================================
                            Property
=========================================================================*/

export type PropertyProps = {
  key: string | Identifier,
  value?: FunctionExpression | Literal,
  kind: ast.PropertyKind,
  method?: boolean,
  shorthand?: boolean,
  computed?: boolean
};

@JsNodeFactory.registerType
export class Property extends JsNode<ast.Property, PropertyProps> {

  build(props: PropertyProps, children: any[]): this {
    let key = this.getKey(props);

    this.node = b.property(
      props.kind,
      key,
      this.getValue(props, children)
    );
    return this;
  }

  key(): Identifier {
    return this.getNodeForProp<Identifier>('key');
  }

  private getValue(props: PropertyProps, children: any[]) {

    if (props.value) {
      return this.getNodeOrFallback(props.value, b.literal);
    }
    if (children.length < 1) {
      throw new Error("Must supplu value in either props or as a child");
    } else {
      return this.getNodeOrFallback(children[0], b.literal);
    }
  }

  private getKey(props: PropertyProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier().build({ name: <string>props.key }, []).node;
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

  build(props: ObjectExpressionProps, children: any[]): this {
    this.node = b.objectExpression(this.getProperties(children));
    return this;
  }

  private getProperties(children: any[]): ast.Property[] {
    let nodes = Array<ast.Property>();
    if (children[0] instanceof Array) {
      let props = new Array<ast.Property>();
      for (const p of children[0]) {
        if (p instanceof Property) {
          props.push(p.node as ast.Property);
        }
      }
      return props;
    }
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

function getSingleExpression(children: GenericExpression[],
  allowNull: boolean, statement: string): ast.Expression {

  if (children.length === 0 || children == null) {
    if (!allowNull) {
      throw new Error("Expression statement must contain 1 statement");
    }
    return null;
  }

  if (children.length > 1) {
    throw new Error("Expression statement can not contain more than 1 statement");
  }
  let node = children[0];
  switch (node.type()) {
    case "Identifier":
    case "Literal":
    case "CallExpression":
    case "AssignmentExpression":
    case "VariableDeclaration":
      return node.node;
    default:
      throw new Error("The expression in an " + statement +
        " must be either an Identifier, CallExpression, AssignmentExpression, VariableDeclaration, or a Literal");
  }
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = StatementProps;

@JsNodeFactory.registerType
export class ExpressionStatement
  extends Statement<ast.ExpressionStatement, ExpressionStatementProps> {

  build(props: ExpressionStatementProps, children: any[]): this {
    this.node = b.expressionStatement(
      getSingleExpression(children, false, ExpressionStatement.name));
    return this;
  }
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

@JsNodeFactory.registerType
export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {
  build(props: ReturnStatementProps, children: GenericExpression[]): this {
    this.node = <ast.ReturnStatement>b.returnStatement(
      getSingleExpression(children, true, ReturnStatement.name));
    return this;
  }
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = ExpressionProps;

@JsNodeFactory.registerType
export class ThisExpression
  extends Expression<ast.ThisExpression, ThisExpressionProps> {

  static create() {
    return new ThisExpression().build({}, []);
  }

  build(props: ThisExpressionProps, children: any[]): this {
    this.node = b.thisExpression();
    return this;
  }
}

/*========================================================================
                            Member Expression
=========================================================================*/

export type MemberExpressionProps = ExpressionProps & {
  object?: GenericExpression | string,
  property: GenericExpression | string
};

@JsNodeFactory.registerType
export class MemberExpression
  extends Expression<ast.MemberExpression, MemberExpressionProps> {

  build(props: MemberExpressionProps, children: any[]): this {
    let object: ast.Expression;
    if (!props.object || props.object === 'this') {
      object = b.thisExpression();
    } else {
      object = this.getNodeOrFallback(props.object, b.identifier);
    }
    this.node = b.memberExpression(object,
      this.getNodeOrFallback(props.property, b.identifier));
    return this;
  }

  object() {
    return this.getNodeForProp<GenericExpression>('object');
  }

  property() {
    return this.getNodeForProp<GenericExpression>('property');
  }
}

/*========================================================================
                            Assignment Expression
=========================================================================*/

export type AssignmentOperator = ast.AssignmentOperator;
export type AssignmentExpressionProps = {
  operator?: ast.AssignmentOperator,
  left?: string | Identifier | MemberExpression,
  right?: string | Identifier | Literal | CallExpression | NewExpression | ObjectExpression
};

@JsNodeFactory.registerType
export class AssignmentExpression
  extends Expression<ast.AssignmentExpression, AssignmentExpressionProps> {

  get operator() {
    return this.node.operator;
  }

  set operator(value: AssignmentOperator) {
    this.node.operator = value;
  }

  left(): GenericJsNode {
    return this.getNodeForProp<GenericJsNode>('left');
  }

  right(): GenericJsNode {
    return this.getNodeForProp<GenericJsNode>('right');
  }

  build(props: AssignmentExpressionProps, children: any[]): this {
    let operator = props.operator || '=';
    this.node = b.assignmentExpression(
      operator.toString(),
      this.getLeft(props, children),
      this.getRight(props, children));
    return this;
  }

  private getLeft(props: AssignmentExpressionProps, children: any[]) {
    if (children.length > 0) {
      return this.getNodeOrFallback(children[0], b.identifier);
    }
    return this.getNodeOrFallback(props.left, b.identifier);
  }

  private getRight(props: AssignmentExpressionProps, children: any[]) {
    if (children.length > 1) {
      return this.getNodeOrFallback(children[1], b.literal);
    }
    return this.getNodeOrFallback(props.right, b.literal);
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
export class ClassDeclaration<T extends ast.ClassDeclaration, P extends ClassDeclarationProps>
  extends JsNode<T, P> {

  get name(): string {
    return this.id().name;
  }

  set name(value: string) {
    this.id().name = value;
  }

  build(props: P, children: JsNode<ast.ClassBodyElement, any>[]): this {
    this.node = <T>b.classDeclaration(
      this.getNodeOrFallback(props.id, b.identifier),
      b.classBody(children.map(c => c.node)),
      props.superClass ? this.getNodeOrFallback(props.superClass, b.identifier) : null
    );
    return this;
  }

  id(): Identifier {
    return this.getNodeForProp<Identifier>('id');
  }

  superClass(): GenericExpression {
    return this.getNodeForProp<GenericExpression>('superClass');
  }

  findConstructor(): MethodDefinition {
    return this
      .findChildrenOfType(MethodDefinition, m => m.kind === 'constructor')
      .first();
  }

  createConstructor(): this {
    this.findFirstChildOfType(ClassBody).createConstructor();
    return this;
  }
}

export type GenericClassDeclaration = ClassDeclaration<
  ast.ClassDeclaration, ClassDeclarationProps>;

/*========================================================================
                            Class Body
=========================================================================*/

export type ClassBodyProps = {
};

@JsNodeFactory.registerType
export class ClassBody extends JsNode<ast.ClassBody, ClassBodyProps> {
  build(props: ClassBodyProps, children: any[]): this {
    // this.node = b.classBody(
    //   children
    //     .map(c => (c instanceof JsNode) ? c.node : null)
    //     .filter(c => c)
    // );
    // return this;
    throw new Error('ClassBody is created implicitly when creating a ClassDeclaration');
  }

  createConstructor(): this {
    this._path.get('body').unshift(
      b.methodDefinition('constructor',
        b.identifier('constructor'),
        b.functionExpression(null, [],
          b.blockStatement([
            b.expressionStatement(
              b.callExpression(b.super(), [])
            )
          ])
        )
      )
    );
    return this;
  }

  createMethod(node: ast.Node, index?: number): this {
    this._path.get('body').push(node);
    return this;
  }
}

/*========================================================================
                            Method Definition
=========================================================================*/

export type MethodDefinitionProps = {
  key: Identifier | string,
  kind: ast.MethodKind,
  computed?: boolean,
  staticMethod?: boolean,
  expression?: FunctionExpression
};

@JsNodeFactory.registerType
export class MethodDefinition
  extends JsNode<ast.MethodDefinition, MethodDefinitionProps> {

  get kind(): ast.MethodKind {
    return this.node.kind;
  }

  set kind(kind: ast.MethodKind) {
    this.node.kind = kind;
  }

  key(): GenericExpression {
    return this.getNodeForProp<GenericExpression>('key');
  }

  build(props: MethodDefinitionProps, children: any[]): this {
    this.node = b.methodDefinition(
      props.kind,
      this.getKey(props),
      this.getFunction(props, children),
      this.getBool(props.staticMethod)
    );
    return this;
  }

  methodName(): string {
    return this.findFirstChildOfType(Identifier).name;
  }

  methodArgs(): JsNodeList<Pattern> {
    return this
      .findFirstChildOfType(FunctionExpression)
      .params();
  }

  body() {
    return this.findFirstChildOfType(FunctionExpression).body();
  }

  private getBool(val?: boolean): boolean {
    if (typeof val === "undefined") {
      return false;
    }
    return val;
  }

  private getKey(props: MethodDefinitionProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier().build({ name: <string>props.key }, []).node;
    }
    return (props.key as Identifier).node;
  }

  private getFunction(props: MethodDefinitionProps,
    children: any[]): ast.Function {

    if (props.expression) {
      return props.expression.node;
    }
    if (children.length === 0) {
      return new FunctionExpression().build({}, []).node;
    }
    return (children[0] as FunctionExpression).node;
  }
}

/*========================================================================
                            New Expression
=========================================================================*/

export type NewExpressionChild = (ast.Expression | ast.SpreadElement);

export type NewExpressionProps = {
  callee: string | GenericExpression
};

@JsNodeFactory.registerType
export class NewExpression extends JsNode<ast.NewExpression, NewExpressionProps> {

  callee(): GenericExpression {
    return this.getNodeForProp<GenericExpression>('callee');
  }

  build(props: NewExpressionProps,
    children: JsNode<NewExpressionChild, any>[]): this {

    this.node = ast.builders.newExpression(
      this.getNodeOrFallback(props.callee, b.identifier),
      this.getArgs(children)
    );
    return this;
  }

  private getArgs(children: JsNode<NewExpressionChild, any>[]): NewExpressionChild[] {
    const nodes: NewExpressionChild[] = [];
    for (const child of children) {
      nodes.push(child.node);
    }
    return nodes;
  }
}

export type Pattern =
  Identifier /*| ObjectPattern | ArrayPattern | RestElement |
  AssignmentPattern*/ | MemberExpression;


/*========================================================================
                            Binary Expression
=========================================================================*/

export type BinaryOperator = ast.BinaryOperator;
export type BinaryExpressionProps = ExpressionProps & {
  left: GenericExpression,
  operator: string,
  right: GenericExpression
};

@JsNodeFactory.registerType
export class BinaryExpression extends JsNode<ast.BinaryExpression, BinaryExpressionProps> {
  get operator() {
    return this.node.operator;
  }

  set operator(value: BinaryOperator) {
    this.node.operator = value;
  }

  left() {
    return this.getNodeForProp<GenericExpression>('left');
  }

  right() {
    return this.getNodeForProp<GenericExpression>('right');
  }

  build(props: BinaryExpressionProps, children: GenericJsNode[]): this {
    this.node = ast.builders.binaryExpression(
      props.operator,
      props.left.node,
      props.right.node
    );
    return this;
  }
}

/*========================================================================
                             Array Expression
=========================================================================*/

export type ArrayExpressionProps = ExpressionProps & {
  elements: Array<GenericExpression/* | SpreadElement*/>;
};

@JsNodeFactory.registerType
export class ArrayExpression extends JsNode<ast.ArrayExpression, ArrayExpressionProps> {

  build(props: ArrayExpressionProps, children: GenericJsNode[]): this {
    if (!props.elements) {
      props.elements = [];
    }
    this.node = ast.builders.arrayExpression(props.elements.map(n => n.node));
    return this;
  }
}

/*========================================================================
                            Import Specifier
=========================================================================*/

export type ImportSpecifierProps = {
  imported: Identifier,
  local: Identifier
};

@JsNodeFactory.registerType
export class ImportSpecifier extends JsNode<ast.ImportSpecifier, ImportSpecifierProps> {
  build(props: ImportSpecifierProps, children: GenericJsNode[]): this {
    this.node = ast.builders.importSpecifier(
      props.imported.node,
      props.local.node
    );
    return this;
  }
}

/*========================================================================
                            Import Declaration
=========================================================================*/

export type ImportDeclarationProps = {
  source: Literal
};

@JsNodeFactory.registerType
export class ImportDeclaration extends JsNode<ast.ImportDeclaration, ImportDeclarationProps> {
  build(props: ImportDeclarationProps, children: GenericJsNode[]): this {
    this.node = ast.builders.importDeclaration(
      this.getSpecifiers(children, new Array<ast.Node>()),
      props.source.node
    );
    return this;
  }

  private getSpecifiers(children: GenericJsNode[], nodes: ast.Node[]): ast.Node[] {
    for (const child of children) {
      if (child instanceof ImportSpecifier) {
        nodes.push(child.node);
      } else if (child instanceof Array) {
        nodes = this.getSpecifiers(child, nodes);
      } else {
        throw new Error("Import Delcaration child must be Import Specifiers or arrays of Import Specifiers");
      }
    }
    return nodes;
  }
}

/*========================================================================
                            Unary Expression
=========================================================================*/
export type UnaryExpressionProps = {
  arguement: GenericExpression,
  operator: "!" | "delete" | "typeof" | "void" | "+"
};

@JsNodeFactory.registerType
export class UnaryExpression extends Expression<ast.UnaryExpression, UnaryExpressionProps> {
  build(props: UnaryExpressionProps, children: GenericJsNode[]): this {
    this.node = ast.builders.unaryExpression(props.operator, props.arguement.node);
    return this;
  }
}

/*========================================================================
                            If Statement
=========================================================================*/
export type IfStatementProps = {
  test: GenericExpression
};

@JsNodeFactory.registerType
export class IfStatement extends Statement<ast.IfStatement, IfStatementProps> {
  build(props: IfStatementProps, children: GenericJsNode[]): this {
    this.node = ast.builders.ifStatement(props.test.node, this.getConsequent(children));
    return this;
  }

  consequent(): GenericStatement {
    return this.getNodeForProp('consequent') as GenericStatement;
  }

  private getConsequent(children: GenericJsNode[]): ast.Statement {
    if (children.length === 0) {
      return ast.builders.blockStatement([]);
    }
    const first = children[0];
    if (children.length === 1 && first instanceof BlockStatement) {
      return first.node;
    }
    return ast.builders.blockStatement(children.map(child => {
      if (child instanceof Statement) {
        return child.node as ast.Statement;
      }
      throw new Error("Children of an IfStatement must be statements");
    }));
  }

}


/*========================================================================
                            JSX Identifier
=========================================================================*/

export type JSXIdentifierProps = {
  name: string
};

@JsNodeFactory.registerType
export class JSXIdentifier extends Expression<ast.JSXIdentifier, JSXIdentifierProps> {

  build(props: JSXIdentifierProps, children: any[]): this {
    this.node = b.jsxIdentifier(props.name);
    return this;
  }
}
