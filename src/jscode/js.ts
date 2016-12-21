import {
  JsNode,
  JsNodeFactory,
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
  build(props: FileProps, children: any[]): File {
    return super.build(props, children) as this;
  }
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = {
};

@JsNodeFactory.registerType
export class Program extends JsNode<ast.Program, ProgramProps> {
  build(props: ProgramProps, children: any[]): Program {
    return super.build(props, children) as this;
  }
}

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = {
};

@JsNodeFactory.registerType
export class Expression<T extends ast.Expression, P extends ExpressionProps>
  extends JsNode<T, P> {

  build(props: P, children: any[]): Expression<T, P> {
    return super.build(props, children) as this;
  }
}

export type GenericExpression = Expression<ast.Expression, ExpressionProps>;

/*========================================================================
                                Statement
=========================================================================*/

export type StatementProps = {
};

@JsNodeFactory.registerType
export class Statement<T extends ast.Statement, P extends StatementProps>
  extends JsNode<T, P> {

  build(props: P, children: any[]): Statement<T, P> {
    return super.build(props, children) as this;
  }
}

export type GenericStatement = Statement<ast.Statement, StatementProps>;

/*========================================================================
                            Variable Delcaration
=========================================================================*/

export type VariableDeclarationProps = {
  name?: string,
  kind?: ast.VariableKind
};

@JsNodeFactory.registerType
export class VariableDeclaration<T extends ast.VariableDeclaration, P extends VariableDeclarationProps>
  extends JsNode<T, P> {

  build(props: P, children: any[]): VariableDeclaration<T, P> {

    let declarators = this.getDeclarators(props, children);
    this.node = <T>b.variableDeclaration(props.kind || 'var', declarators);
    return super.build(props, children) as this;
  }

  declarations() {
    return this.getNodes<VariableDeclarator>('declarations');
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
      if (child.check(VariableDeclarator)) {
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

  id(): Identifier {
    return this.getNode<Identifier>('id');
  }

  build(props: VariableDeclaratorProps, children: GenericExpression[] = []): VariableDeclarator {
    let identifier = b.identifier(props.name);
    if (children.length > 1) {
      throw new Error("VariableDeclarator can only have one child");
    }
    let child = children.length ? children[0].node : null;
    this.node = b.variableDeclarator(identifier, child);
    return super.build(props, children) as this;
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
  static fromValue(value: any) {
    return new Literal().build({ value: value }, []);
  }

  build(props: LiteralProps, children: any[]): Literal {
    this.node = b.literal(props.value);
    return super.build(props, children) as this;
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

  build(props: IdentifierProps, children: any[]): Identifier {
    this.node = b.identifier(props.name);
    return super.build(props, children) as this;
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

  build(props: CallExpressionProps, children: any[] = []): CallExpression {
    let args = this.getArgs(children);
    this.node = b.callExpression(this.getNodeOrFallback(props.callee, b.identifier), args);
    return super.build(props, children) as this;
  }

  callee() {
    return this.getNode('callee');
  }

  private getArgs(children: any[]): ast.Expression[] {
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

  build(props: FunctionDeclarationProps, children: any[]): FunctionDeclaration {
    let identifier = b.identifier(props.name);
    let params = this.getParameters(children);
    let body = this.getBody(children);
    this.node = b.functionDeclaration(identifier, params, body);
    return super.build(props, children) as this;
  }

  private getParameters(children: any[]): ast.Pattern[] {
    let params: ast.Pattern[] = [];
    for (let child of children) {
      if (child.check(Identifier)) {
        params.push(child.node);
      }
    }
    return params;
  }

  private getBody(children: any[]): ast.BlockStatement {
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

  build(props: FunctionExpressionProps, children: any[]): FunctionExpression {
    this.node = b.functionExpression(
      this.getId(props),
      this.getParameters(children),
      this.getBody(children)
    );
    return super.build(props, children) as this;
  }

  params() {
    return this.getNodes<Pattern>('params');
  }

  body() {
    return this.getNode<BlockStatement | GenericExpression>('body');
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
      return new Identifier().build({name: props.id}, []).node;
    } else {
      return (props.id as Identifier).node;
    }
  }

  private getParameters(children: any[]): ast.Pattern[] {
    let params = Array<ast.Pattern>();
    for (let index in children) {
      if (children[index].check(Identifier)) {
        params.push(children[index].node as ast.Pattern);
      }
    }
    return params;
  }

  private getBody(children: any[]): ast.BlockStatement {
    for (let index in children) {
      if (children[index].check(BlockStatement)) {
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
export class BlockStatement extends JsNode<ast.BlockStatement, BlockStatementProps> {
  build(props: BlockStatementProps, children: GenericStatement[]): BlockStatement {
    let statements: ast.Statement[] = [];
    for (let child of children) {
      statements.push(child.node);
    }
    this.node = b.blockStatement(statements);
    return super.build(props, children) as this;
  }

  appendStatement(node: (ast.Statement | GenericStatement)) {
    this.node.body.push(<ast.Statement>this.toAstNode(node));
  }
}

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
  props: PropertyProps;

  build(props: PropertyProps, children: any[]): Property {
    let key = this.getKey(props);

    this.node = b.property(
      props.kind,
      key,
      this.getValue(props, children)
    );
    return super.build(props, children) as this;
  }

  key(): Identifier {
    return this.getNode<Identifier>('key');
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
      return new Identifier().build({name: <string>props.key}, []).node;
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

  build(props: ObjectExpressionProps, children: any[]): ObjectExpression {
    this.node = b.objectExpression(this.getProperties(children));
    return super.build(props, children) as this;
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

export type ExpressionStatementProps = StatementProps;

@JsNodeFactory.registerType
export class ExpressionStatement
  extends Statement<ast.ExpressionStatement, ExpressionStatementProps> {

  build(props: ExpressionStatementProps, children: any[]): ExpressionStatement {
    this.node = b.expressionStatement(
      getSingleExpression(children, false, ExpressionStatement.name));
    return super.build(props, children) as this;
  }
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

@JsNodeFactory.registerType
export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {
  build(props: ReturnStatementProps, children: GenericExpression[]): ReturnStatement {
    this.node = <ast.ReturnStatement>b.returnStatement(
      getSingleExpression(children, true, ReturnStatement.name));
    return super.build(props, children) as this;
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

  build(props: ThisExpressionProps, children: any[]): ThisExpression {
    this.node = b.thisExpression();
    return super.build(props, children) as this;
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

  build(props: MemberExpressionProps, children: any[]): MemberExpression {
    let object: ast.Node;
    if (!props.object || props.object === 'this') {
      object = b.thisExpression();
    } else {
      object = this.getNodeOrFallback(props.object, b.identifier);
    }
    this.node = b.memberExpression(object,
      this.getNodeOrFallback(props.property, b.identifier));
    return super.build(props, children) as this;
  }

  object() {
    return this.getNode<GenericExpression>('object');
  }

  property() {
    return this.getNode<GenericExpression>('property');
  }
}

/*========================================================================
                            Assignment Expression
=========================================================================*/

export type AssignmentExpressionProps = {
  operator?: ast.AssignmentOperator,
  left?: string | Identifier | MemberExpression,
  right?: string | Identifier | Literal | CallExpression | NewExpression | ObjectExpression
};

@JsNodeFactory.registerType
export class AssignmentExpression
  extends JsNode<ast.AssignmentExpression, AssignmentExpressionProps> {

  build(props: AssignmentExpressionProps, children: any[]): AssignmentExpression {
    let operator = props.operator || '=';
    this.node = b.assignmentExpression(
      operator.toString(),
      this.getLeft(props, children),
      this.getRight(props, children));
    return super.build(props, children) as this;
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

  build(props: P, children: any[]): ClassDeclaration<T, P> {
    this.node = <T>b.classDeclaration(
      this.getNodeOrFallback(props.id, b.identifier),
      new ClassBody().build({}, children).node,
      props.superClass ? this.getNodeOrFallback(props.superClass, b.identifier) : null
    );
    return super.build(props, children) as this;
  }

  id(): Identifier {
    return this.getNode<Identifier>('id');
  }

  superClass(): GenericExpression {
    return this.getNode<GenericExpression>('superClass');
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
  build(props: ClassBodyProps, children: any[]): ClassBody {
    this.node = b.classBody(this.asNodeArray(children));
    return super.build(props, children) as this;
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

  private asNodeArray(children: any[]): ast.ClassBodyElement[] {
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

  props: MethodDefinitionProps;

  get kind(): ast.MethodKind {
    return this.node.kind;
  }

  set kind(kind: ast.MethodKind) {
    this.node.kind = kind;
  }

  build(props: MethodDefinitionProps, children: any[]): MethodDefinition {
    this.node = b.methodDefinition(
      props.kind,
      this.getKey(props),
      this.getFunction(props, children),
      this.getBool(props.staticMethod)
    );
    return super.build(props, children) as this;
  }

  methodName(): string {
    return this.findFirstChildOfType(Identifier).name;
  }

  methodArgs(): JsNodeList<Pattern> {
    return this
      .findFirstChildOfType(FunctionExpression)
      .params();
  }

  body<T extends GenericJsNode>() {
    return <T>this.findFirstChildOfType(FunctionExpression).body();
  }

  private getBool(val?: boolean): boolean {
    if (typeof val === "undefined") {
      return false;
    }
    return val;
  }

  private getKey(props: MethodDefinitionProps): ast.Expression {
    if (props.key.constructor.name === "String") {
      return new Identifier().build({name: <string>props.key}, []).node;
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
  props: NewExpressionProps;

  build(props: NewExpressionProps,
    children: JsNode<NewExpressionChild, any>[]): NewExpression {

    this.node = ast.builders.newExpression(
      this.getNodeOrFallback(props.callee, b.identifier),
      this.getArgs(children)
    );
    return super.build(props, children) as this;
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
    left: Identifier,
    operator: string,
    right:  Identifier
}

@JsNodeFactory.registerType
export class BinaryExpression extends JsNode<ast.BinaryExpression, BinaryExpressionProps> {
  build(props: BinaryExpressionProps, children: GenericJsNode[]): BinaryExpression {
    this.node = ast.builders.binaryExpression(
      props.operator,
      props.left.node,
      props.right.node
    );
    return super.build(props, children) as this;
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
  props: ImportSpecifierProps;
  build(props: ImportSpecifierProps, children: GenericJsNode[]): ImportSpecifier {
    this.node = ast.builders.importSpecifier(
      props.imported.node,
      props.local.node
    )
    return super.build(props, children) as this;
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
  props: ImportDeclarationProps;
  build(props: ImportDeclarationProps, children: GenericJsNode[]): ImportDeclaration {
    this.node = ast.builders.importDeclaration(
      this.getSpecifiers(children, new Array<ast.Node>()),
      props.source.node
    )
    return super.build(props, children) as this;
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
