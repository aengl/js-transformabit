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
  protected meta: JsNodeMeta = {
    program: {
      fromChild: [{ type: Program }]
    }
  };

  protected builder = b.file;
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = JsNodeProps;

@JsNodeFactory.registerType
@JsContainerNode()
export class Program
  extends JsNode<ast.Program, ProgramProps> {

  protected builder = (...statements) => b.program(statements);

  append: (node: GenericStatement) => this;
  insert: (index: number, node: GenericStatement) => this;
  prepend: (node: GenericStatement) => this;
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
      fromProp: p => p,
      convert: b.identifier
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
export class Literal extends Expression<ast.Literal, LiteralProps> {
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
      fromProp: p => p,
      convert: b.identifier
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
@JsContainerNode({
  getChildNodes: function() { return (this as FunctionDeclaration).node.body.body; }
})
export class FunctionDeclaration
  extends JsNode<ast.FunctionDeclaration, FunctionDeclarationProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      convert: b.identifier
    },
    body: {
      fromChild: [{ type: BlockStatement }],
      default: null
    }
  };

  protected builder = (id, body, ...params) =>
    b.functionDeclaration(id, params, body || b.blockStatement([]));

  // TODO
  // protected childTypes = [Pattern];

  append: (node: GenericStatement) => this;
  insert: (index: number, node: GenericStatement) => this;
  prepend: (node: GenericStatement) => this;
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

  protected meta: JsNodeMeta = {
    id: {
      fromProp: p => p,
      convert: b.identifier,
      default: null
    },
    body: {
      fromChild: [{ type: BlockStatement }],
      default: null
    }
  };

  protected builder = (id, body, ...params) =>
    b.functionExpression(id, params, body || b.blockStatement([]));

  params() {
    return this.getNodesForProp<Pattern>('params');
  }

  body() {
    return this.getNodeForProp<GenericBlockStatement | GenericExpression>('body');
  }
}

/*========================================================================
                            Block Statement
=========================================================================*/

export type BlockStatementProps = {
};

@JsNodeFactory.registerType
@JsContainerNode()
export class BlockStatement<T extends ast.BlockStatement, P extends BlockStatementProps>
  extends Statement<T, P> {

  protected builder = (...statements) => b.blockStatement(statements);

  append: (node: GenericStatement) => this;
  insert: (index: number, node: GenericStatement) => this;
  prepend: (node: GenericStatement) => this;
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

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'init'
    },
    key: {
      fromProp: p => p,
      fromChild: [{ type: Identifier }],
      convert: b.identifier
    },
    value: {
      fromProp: p => p,
      fromChild: [{ type: Expression }/*, { type: Pattern }*/],
      convert: b.literal
    }
  };

  protected builder = b.property;

  key(): Identifier {
    return this.getNodeForProp<Identifier>('key');
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

  protected builder = (...properties) => b.objectExpression(properties);
  protected childTypes = [Property];
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = StatementProps;

@JsNodeFactory.registerType
export class ExpressionStatement
  extends Statement<ast.ExpressionStatement, ExpressionStatementProps> {

  protected builder = b.expressionStatement;
  protected childTypes = [
    Identifier,
    Literal,
    CallExpression,
    AssignmentExpression,
    VariableDeclaration
  ];
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {
};

@JsNodeFactory.registerType
export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {

  protected builder = (expression) => b.returnStatement(expression || null);
  protected childTypes = [
    Identifier,
    Literal,
    CallExpression,
    AssignmentExpression,
    VariableDeclaration
  ];
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = ExpressionProps;

@JsNodeFactory.registerType
export class ThisExpression
  extends Expression<ast.ThisExpression, ThisExpressionProps> {

  protected builder = b.thisExpression;
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
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: s => s === 'this' ? b.thisExpression() : b.identifier(s),
      default: b.thisExpression
    },
    property: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.identifier
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
  left?: string | Pattern | MemberExpression,
  right?: string | GenericExpression
};

@JsNodeFactory.registerType
export class AssignmentExpression
  extends Expression<ast.AssignmentExpression, AssignmentExpressionProps> {

  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p,
      default: '='
    },
    left: {
      fromProp: p => p,
      fromChild: [{ type: Identifier }, { type: MemberExpression }],
      convert: b.identifier
    },
    right: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.literal
    }
  };

  protected builder = b.assignmentExpression;

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

  protected meta: JsNodeMeta = {
    id: {
      fromProp: p => p,
      convert: b.identifier
    },
    superClass: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.identifier,
      default: null
    },
    body: {
      fromProp: p => p,
      fromChild: [{ type: ClassBody }],
      default: null
    }
  };

  protected builder = (id, superClass, body, ...elements) => b.classDeclaration(
    id,
    body || b.classBody(elements),
    superClass
  );

  // TODO
  // protected childTypes = [ClassBodyElement];

  get name(): string {
    return this.id().name;
  }

  set name(value: string) {
    this.id().name = value;
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
  protected builder = (...elements) => b.classBody(elements);

  // TODO
  // protected childTypes = [ClassBodyElement];

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

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'method'
    },
    key: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.identifier
    },
    static: {
      fromProp: p => p,
      default: false
    },
    value: {
      fromProp: p => p,
      fromChild: [{ type: FunctionExpression }],
      default: null
    }
  };

  protected builder = (kind, key, isStatic, value) =>
    b.methodDefinition(
      kind,
      key,
      value || b.functionExpression(null, [], b.blockStatement([])),
      isStatic
    );

  get kind(): ast.MethodKind {
    return this.node.kind;
  }

  set kind(kind: ast.MethodKind) {
    this.node.kind = kind;
  }

  key() {
    return this.getNodeForProp<GenericExpression>('key');
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

  protected meta: JsNodeMeta = {
    callee: {
      fromProp: p => p,
      fromChild: [{ type: Expression }/*, { type: Super }*/],
      convert: b.identifier
    }
  };

  protected builder = (callee, ...args) => b.newExpression(callee, args);
  protected childTypes = [Expression/*, SpreadElement*/];

  callee(): GenericExpression {
    return this.getNodeForProp<GenericExpression>('callee');
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
  operator?: string,
  left?: GenericExpression,
  right?: GenericExpression
};

@JsNodeFactory.registerType
export class BinaryExpression extends JsNode<ast.BinaryExpression, BinaryExpressionProps> {
  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p,
      default: '==='
    },
    left: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.identifier
    },
    right: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.literal
    }
  };

  protected builder = b.binaryExpression;

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
}

/*========================================================================
                             Array Expression
=========================================================================*/

export type ArrayExpressionProps = ExpressionProps;

@JsNodeFactory.registerType
export class ArrayExpression extends JsNode<ast.ArrayExpression, ArrayExpressionProps> {

  protected builder = (...elements) => b.arrayExpression(elements);
  protected childTypes = [Expression]; // TODO: should be ArrayExpressionElements
}

/*========================================================================
                            Import Specifier
=========================================================================*/

export type ImportSpecifierProps = {
  imported?: string | Identifier,
  local?: string | Identifier
};

@JsNodeFactory.registerType
export class ImportSpecifier extends JsNode<ast.ImportSpecifier, ImportSpecifierProps> {
  protected meta: JsNodeMeta = {
    imported: {
      fromProp: p => p,
      fromChild: [{ type: Identifier }],
      convert: b.identifier,
      default: null
    },
    local: {
      fromProp: p => p,
      fromChild: [{ type: Identifier }],
      convert: b.identifier,
      default: null
    }
  };

  protected builder = (imported, local) =>
    b.importSpecifier(imported || local, local || imported);
}

/*========================================================================
                            Import Declaration
=========================================================================*/

export type ImportDeclarationProps = {
  source: Literal
};

@JsNodeFactory.registerType
export class ImportDeclaration extends JsNode<ast.ImportDeclaration, ImportDeclarationProps> {
  protected meta: JsNodeMeta = {
    source: {
      fromProp: p => p,
      fromChild: [{ type: Literal }],
      convert: b.literal
    }
  };

  protected builder = (source, ...specifiers) => b.importDeclaration(specifiers, source);
}

/*========================================================================
                            Unary Expression
=========================================================================*/

export type UnaryExpressionProps = {
  operator: '!' | 'delete' | 'typeof' | 'void' | '+',
  argument?: string | GenericExpression
};

@JsNodeFactory.registerType
export class UnaryExpression extends Expression<ast.UnaryExpression, UnaryExpressionProps> {
  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p
    },
    argument: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.identifier
    }
  };

  protected builder = b.unaryExpression;
}

/*========================================================================
                            If Statement
=========================================================================*/

export type IfStatementProps = {
  test?: GenericExpression
};

@JsNodeFactory.registerType
export class IfStatement extends Statement<ast.IfStatement, IfStatementProps> {
  protected meta: JsNodeMeta = {
    test: {
      fromProp: p => p,
      fromChild: [{ type: Expression }]
    },
    consequent: {
      fromProp: p => p,
      fromChild: [{ type: Statement }],
      default: () => b.blockStatement([])
    },
    alternate: {
      fromProp: p => p,
      fromChild: [{ type: Statement }],
      default: null
    }
  };

  protected builder = b.ifStatement;

  consequent(): GenericStatement {
    return this.getNodeForProp('consequent') as GenericStatement;
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

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p
    }
  };

  protected builder = b.jsxIdentifier;
}

/*========================================================================
                            JSX Expression Container
=========================================================================*/

export type JSXExpressionContainerProps = {
  expression?: GenericExpression | number | boolean
};

@JsNodeFactory.registerType
export class JSXExpressionContainer
  extends Expression<ast.JSXExpressionContainer, JSXExpressionContainerProps> {

  protected meta: JsNodeMeta = {
    expression: {
      fromProp: p => p,
      fromChild: [{ type: Expression }],
      convert: b.literal
    }
  };

  protected builder = b.jsxExpressionContainer;
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
    if (typeof props.value === 'string') {
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
    if (typeof props.name === 'string') {
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
    if (typeof props.name === 'string') {
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
        throw new Error('Children of JSXOpeningElement must be of type JSXAttribute');
      }
    }
    return attrs;
  }

  private isSelfClosing(props: JSXOpeningElementProps): boolean {
    if (typeof props.selfClosing === 'undefined') {
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
    if (typeof props.name === 'string') {
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
      } else if (typeof child === 'string') {
        childNodes.push(ast.builders.literal(child));
      } else {
        throw new Error('Children of JSXElement must be either of type Literal, JSXExpressionContainer, or JSXElement');
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
    if (typeof props.selfClosing === 'undefined') {
      return false;
    }
    return props.selfClosing;
  }

  private getName(name: string | JSXIdentifier | Identifier): ast.JSXIdentifier {
    if (name instanceof JSXIdentifier) {
      return name.node;
    }
    if (typeof name === 'string') {
      return ast.builders.jsxIdentifier(name);
    }
    return ast.builders.jsxIdentifier(name.name);
  }
}
