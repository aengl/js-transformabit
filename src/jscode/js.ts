import {
  JsNode,
  JsNodeType,
  JsNodeFactory,
  JsContainerNode,
  JsNodeList,
  GenericJsNode,
  JsNodeProps,
  JsNodeMeta
} from '../JsNode';
import { ast } from '../../deps/bundle';

const b = ast.builders;

/*========================================================================
                                  File
=========================================================================*/

export type FileProps = JsNodeProps;

@JsNodeFactory.registerType
export class File extends JsNode<ast.File, FileProps> {
  build(props: FileProps, children: any[]): this {
    return this;
  }
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = JsNodeProps;

@JsNodeFactory.registerType
export class Program extends JsContainerNode<ast.Program, ProgramProps, GenericStatement> {
  protected builder = (...statements: ast.Node[]) => b.program(statements);
}

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = JsNodeProps;

@JsNodeFactory.registerType
export class Expression<T extends ast.Expression, P extends ExpressionProps>
  extends JsNode<T, P> {}

export type GenericExpression = Expression<ast.Expression, ExpressionProps>;

/*========================================================================
                                Statement
=========================================================================*/

export type StatementProps = JsNodeProps;

@JsNodeFactory.registerType
export class Statement<T extends ast.Statement, P extends StatementProps>
  extends JsNode<T, P> {}

export type GenericStatement = Statement<ast.Statement, StatementProps>;

/*========================================================================
                            Variable Declaration
=========================================================================*/

export type VariableDeclarationProps = JsNodeProps & {
  name?: string,
  kind?: ast.VariableKind
};

@JsNodeFactory.registerType
export class VariableDeclaration<
  T extends ast.VariableDeclaration, P extends VariableDeclarationProps>
  extends Statement<T, P> {

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'var'
    }
  };

  protected builder = (kind, ...declarators) => b.variableDeclaration(kind, declarators);

  build(props: P, children: any[]): this {
    if (props.name) {
      // If we get a name we assume there's just one declarator with that name
      // as its id
      return super.build(props, children, this.meta,
        (kind: ast.VariableKind, init: ast.Expression) =>
          b.variableDeclaration(kind, [
            b.variableDeclarator(b.identifier(props.name), init || null)
          ]
        )
      );
    }
    return super.build(props, children);
  }

  declarations() {
    return this.getNodesForProp('declarations', VariableDeclarator);
  }
}

export type GenericVariableDeclaration =
  VariableDeclaration<ast.VariableDeclaration, VariableDeclarationProps>;

/*========================================================================
                            Variable Declarator
=========================================================================*/

export type VariableDeclaratorProps = JsNodeProps & {
  name: string | Pattern
};

@JsNodeFactory.registerType
export class VariableDeclarator
  extends JsNode<ast.VariableDeclarator, VariableDeclaratorProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p.node,
      fromString: b.identifier
    }
  };

  protected builder = (id, init) => b.variableDeclarator(id, init || null);

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
}

/*========================================================================
                            Literal
=========================================================================*/

export type LiteralProps = JsNodeProps & {
  value: ast.LiteralValue
};

@JsNodeFactory.registerType
export class Literal extends JsNode<ast.Literal, LiteralProps> {
  static fromValue(value: any) {
    return new Literal().build({ value: value }, []);
  }

  protected meta: JsNodeMeta = {
    value: {
      fromProp: p => p
    }
  };

  protected builder = b.literal;

  get value(): ast.LiteralValue {
    return this.node.value;
  }

  set value(value: ast.LiteralValue) {
    this.node.value = value;
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
  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p
    }
  };

  protected builder = b.identifier;

  static fromName(name: string) {
    return new Identifier().build({ name: name }, []);
  }

  get name(): string {
    return this.node.name;
  }

  set name(value: string) {
    this.node.name = value;
  }
}

/*========================================================================
                            Call Expression
=========================================================================*/

export type CallExpressionProps = {
  callee: string | GenericExpression
};

@JsNodeFactory.registerType
export class CallExpression
  extends Expression<ast.CallExpression, CallExpressionProps> {

  protected meta: JsNodeMeta = {
    callee: {
      fromProp: p => p.node,
      fromString: b.identifier
    }
  };

  protected builder = (callee, ...args) => b.callExpression(callee, args);

  protected childTypes = [Literal, Identifier, Expression];

  callee() {
    return this.getNodeForProp('callee');
  }
}

/*========================================================================
                            Function Declaration
=========================================================================*/

export type FunctionDeclarationProps = {
  name: string
};

@JsNodeFactory.registerType
export class FunctionDeclaration
  extends JsContainerNode<ast.FunctionDeclaration, FunctionDeclarationProps, GenericStatement> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      fromString: b.identifier
    },
    body: {
      fromChild: [{ type: BlockStatement }],
      default: null
    }
  };

  protected builder = (identifier, body, ...params) =>
    b.functionDeclaration(identifier, params, body || b.blockStatement([]));

  // TODO
  // protected childTypes = [Pattern];

  protected getChildNodes() {
    return this.node.body.body;
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
  property?: GenericExpression | string
};

@JsNodeFactory.registerType
export class MemberExpression
  extends Expression<ast.MemberExpression, MemberExpressionProps> {

  protected meta: JsNodeMeta = {
    object: {
      fromProp: p => p.node,
      fromChild: [{ type: Expression }],
      fromString: s => s === 'this' ? b.thisExpression() : b.identifier(s),
      default: b.thisExpression
    },
    property: {
      fromProp: p => p.node,
      fromChild: [{ type: Expression }],
      fromString: b.identifier
    }
  };

  protected builder = b.memberExpression;

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

  methods() {
    return this.getNodesForProp<MethodDefinition>(['body', 'body']);
  }

  findConstructor() {
    return this
      .findChildrenOfType(MethodDefinition, m => m.kind === 'constructor')
      .first();
  }

  findMethod(name: string) {
    return this
      .findChildrenOfType(MethodDefinition,
        m => m.kind === 'method' && m.methodName() === name)
      .first();
  }

  addMethod(node: (ast.MethodDefinition | MethodDefinition), index?: number): this {
    this.getNodeForProp<ClassBody>('body').addMethod(node, index);
    return this;
  }

  createConstructor(): this {
    this.getNodeForProp<ClassBody>('body').createConstructor();
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

  addMethod(node: (ast.MethodDefinition | MethodDefinition), index?: number): this {
    this._path.get('body').push(node instanceof MethodDefinition ? node.node : node);
    return this;
  }
}

/*========================================================================
                            Method Definition
=========================================================================*/

export type MethodDefinitionProps = {
  key: Identifier | string,
  kind?: ast.MethodKind,
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

  key() {
    return this.getNodeForProp<GenericExpression>('key');
  }

  build(props: MethodDefinitionProps, children: any[]): this {
    this.node = b.methodDefinition(
      props.kind || 'method',
      this.getKey(props),
      this.getFunction(props, children),
      this.getBool(props.staticMethod)
    );
    return this;
  }

  methodName() {
    const key = this.key();
    if (key instanceof Identifier) {
      return key.name;
    }
  }

  methodArgs() {
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

/*========================================================================
                            JSX Expression Container
=========================================================================*/

export type JSXExpressionContainerProps = {
  expression?: GenericExpression | number | boolean
};

@JsNodeFactory.registerType
export class JSXExpressionContainer extends Expression<ast.JSXExpressionContainer, JSXExpressionContainerProps> {
  build(props: JSXExpressionContainerProps, children: any[]): this {
    this.node = b.jsxExpressionContainer(this.getExpression(props, children));
    return this;
  }

  private getExpression(props: JSXExpressionContainerProps, children: any[]): ast.Expression {
    if (props.expression) {
      if (props.expression instanceof Expression) {
        return props.expression.node;
      }
      return ast.builders.literal(props.expression);
    }
    if (children.length === 0) {
      throw new Error("Expression must be specified as a property or as a child element");
    }
    const first = children[0];
    if (first instanceof Expression) {
      return first.node;
    }
    throw new Error("Child must be of type Expression");
  }
}

/*========================================================================
                            JSX Attribute
=========================================================================*/

export type JSXAttributeProps = {
  name: string | JSXIdentifier | Identifier
  value?: string | boolean | number | GenericExpression| JSXExpressionContainer
};

@JsNodeFactory.registerType
export class JSXAttribute extends JsNode<ast.JSXAttribute, JSXAttributeProps> {
  build(props: JSXAttributeProps, children: any[]): this {
    this.node = b.jsxAttribute(this.getName(props), this.getValue(props));
    return this;
  }

  private getValue(props: JSXAttributeProps): ast.Literal | ast.JSXExpressionContainer {
    if (!props.value) {
      return null;
    }
    if (props.value instanceof JSXExpressionContainer) {
      return props.value.node;
    }
    if (typeof props.value === "string") {
      return ast.builders.literal(props.value);
    }
    if (props.value instanceof Expression) {
      return ast.builders.jsxExpressionContainer(props.value.node);
    }
    return ast.builders.jsxExpressionContainer(ast.builders.literal(props.value));
  }

  private getName(props: JSXAttributeProps): ast.JSXIdentifier {
    if (props.name instanceof JSXIdentifier) {
      return props.name.node;
    }
    if (typeof props.name === "string") {
      return ast.builders.jsxIdentifier(props.name);
    }
    return ast.builders.jsxIdentifier(props.name.name);
  }
}

/*========================================================================
                            JSX Opening Element
=========================================================================*/

export type JSXOpeningElementProps = {
  name: string | JSXIdentifier | Identifier
  attributes?: JSXAttribute[],
  selfClosing?: boolean
};

@JsNodeFactory.registerType
export class JSXOpeningElement extends JsNode<ast.JSXOpeningElement, JSXOpeningElementProps> {
  build(props: JSXOpeningElementProps, children: any[]): this {
    this.node = b.jsxOpeningElement(this.getName(props), this.getAttributes(props, children), this.isSelfClosing(props));
    return this;
  }

  private getName(props: JSXOpeningElementProps): ast.JSXIdentifier {
    if (props.name instanceof JSXIdentifier) {
      return props.name.node;
    }
    if (typeof props.name === "string") {
      return ast.builders.jsxIdentifier(props.name);
    }
    return ast.builders.jsxIdentifier(props.name.name);
  }

  private getAttributes(props: JSXOpeningElementProps, children: any[]): ast.JSXAttribute[] {
    if (!props.attributes) {
      return this.getAttributesFromChildren(children);
    }
    return props.attributes.map(attr => attr.node);
  }

  private getAttributesFromChildren(children: any[]): ast.JSXAttribute[] {
    let attrs: ast.JSXAttribute[] = [];
    for (const child of children) {
      if (child instanceof JSXAttribute) {
        attrs.push(child.node);
      } else {
        throw new Error("Children of JSXOpeningElement must be of type JSXAttribute");
      }
    }
    return attrs;
  }

  private isSelfClosing(props: JSXOpeningElementProps): boolean {
    if (typeof props.selfClosing === "undefined") {
      return false;
    }
    return props.selfClosing;
  }

}

/*========================================================================
                            JSX Closing Element
=========================================================================*/

export type JSXClosingElementProps = {
  name: string | JSXIdentifier | Identifier
};

@JsNodeFactory.registerType
export class JSXClosingElement extends JsNode<ast.JSXClosingElement, JSXClosingElementProps> {
  build(props: JSXClosingElementProps, children: any[]): this {
    this.node = b.jsxClosingElement(this.getName(props));
    return this;
  }

  private getName(props: JSXClosingElementProps): ast.JSXIdentifier {
    if (props.name instanceof JSXIdentifier) {
      return props.name.node;
    }
    if (typeof props.name === "string") {
      return ast.builders.jsxIdentifier(props.name);
    }
    return ast.builders.jsxIdentifier(props.name.name);
  }
}

/*========================================================================
                            JSX Element
=========================================================================*/

export type JSXElementProps = {
  name: string | JSXIdentifier | Identifier,
  attributes?: JSXAttribute[],
  selfClosing?: boolean
};

@JsNodeFactory.registerType
export class JSXElement extends JsNode<ast.JSXElement, JSXElementProps> {
  build(props: JSXElementProps, children: any[]): this {
    this.node = b.jsxElement(
      this.getOpeningElement(props),
      ast.builders.jsxClosingElement(this.getName(props.name)),
      this.getElementChildren(children)
    );
    return this;
  }

  private getOpeningElement(props: JSXElementProps): ast.JSXOpeningElement {
    return ast.builders.jsxOpeningElement(
      this.getName(props.name),
      this.getAttributes(props),
      this.isSelfClosing(props)
    );
  }

  private getElementChildren(children: any[]): (ast.Literal | ast.JSXExpressionContainer | ast.JSXElement)[] {
    let childNodes: (ast.Literal | ast.JSXExpressionContainer | ast.JSXElement)[] = [];
    for (const child of children) {
      if (child instanceof Literal || child instanceof JSXExpressionContainer || child instanceof JSXElement) {
        childNodes.push(child.node);
      } else if (typeof child === "string") {
        childNodes.push(ast.builders.literal(child));
      } else {
        throw new Error("Children of JSXElement must be either of type Literal, JSXExpressionContainer, or JSXElement");
      }
    }
    return childNodes;
  }

  private getAttributes(props: JSXElementProps): ast.JSXAttribute[] {
    if (!props.attributes) {
      return [];
    }
    return props.attributes.map(attr => attr.node);
  }

  private isSelfClosing(props: JSXOpeningElementProps): boolean {
    if (typeof props.selfClosing === "undefined") {
      return false;
    }
    return props.selfClosing;
  }

  private getName(name: string | JSXIdentifier | Identifier): ast.JSXIdentifier {
    if (name instanceof JSXIdentifier) {
      return name.node;
    }
    if (typeof name === "string") {
      return ast.builders.jsxIdentifier(name);
    }
    return ast.builders.jsxIdentifier(name.name);
  }
}
