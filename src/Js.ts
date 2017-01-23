/**
 * Specialised JsNode classes for basic AST nodes.
 */

import {
  JsNode,
  JsNodeType,
  JsContainerNode,
  JsNodeList,
  GenericJsNode,
  JsNodeProps,
  JsNodeMeta
} from './JsNode';
import { ast } from '../deps/bundle';

const b = ast.builders;

/*========================================================================
                                  File
=========================================================================*/

export type FileProps = JsNodeProps;

@JsNode.registerType()
export class File extends JsNode<ast.File, FileProps> {
  protected meta: JsNodeMeta = {
    program: {
      fromChild: [Program]
    }
  };

  protected builder = b.file;

  program(): Program {
    return this.getNodeForProp<Program>('program');
  }
}

/*========================================================================
                                 Program
=========================================================================*/

export type ProgramProps = JsNodeProps;

@JsNode.registerType()
@JsContainerNode()
export class Program
  extends JsNode<ast.Program, ProgramProps> {

  protected meta: JsNodeMeta = {
    statements: {
      fromChildren: [JsNode]
    }
  };

  protected builder = b.program;

  append: (node: GenericStatement) => this;
  insert: (index: number, node: GenericStatement) => this;
  prepend: (node: GenericStatement) => this;
}

/*========================================================================
                                Expression
=========================================================================*/

export type ExpressionProps = JsNodeProps;

@JsNode.registerType()
export class Expression<T extends ast.Expression, P extends ExpressionProps>
  extends JsNode<T, P> {}

export type GenericExpression = Expression<ast.Expression, ExpressionProps>;

/*========================================================================
                                Statement
=========================================================================*/

export type StatementProps = JsNodeProps;

@JsNode.registerType()
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

@JsNode.registerType()
export class VariableDeclaration<
  T extends ast.VariableDeclaration, P extends VariableDeclarationProps>
  extends Statement<T, P> {

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'var'
    },
    declarators: {
      fromChildren: [VariableDeclarator, Identifier]
    }
  };

  protected builder = (kind, declarators) => b.variableDeclaration(kind, declarators);

  build(props: P, children: any[]): this {
    if (props.name) {
      // If we get a name we assume there's just one declarator with that name
      // as its id
      return super.build(props, children, {
          kind: {
            fromProp: p => p,
            default: 'var'
          },
          name: {
            fromProp: p => p,
            convert: b.identifier
          },
          init: {
            fromChild: [Expression],
            default: null
          }
        },
        (kind, name, init) =>
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

@JsNode.registerType()
export class VariableDeclarator
  extends JsNode<ast.VariableDeclarator, VariableDeclaratorProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      convert: b.identifier
    },
    init: {
      fromChild: [Expression],
      default: null
    }
  };

  protected builder = b.variableDeclarator;

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

export type LiteralValue = ast.LiteralValue;

export type LiteralProps = JsNodeProps & {
  value: LiteralValue
};

@JsNode.registerType()
export class Literal extends Expression<ast.Literal, LiteralProps> {
  protected meta: JsNodeMeta = {
    value: {
      fromProp: p => p
    }
  };

  protected builder = b.literal;

  get value(): LiteralValue {
    return this.node.value;
  }

  set value(value: LiteralValue) {
    this.node.value = value;
  }
}

/*========================================================================
                            Identifier
=========================================================================*/

export type IdentifierProps = ExpressionProps & {
  name: string
};

@JsNode.registerType()
export class Identifier extends Expression<ast.Identifier, IdentifierProps> {
  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p
    }
  };

  protected builder = b.identifier;

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

@JsNode.registerType()
export class CallExpression
  extends Expression<ast.CallExpression, CallExpressionProps> {

  protected meta: JsNodeMeta = {
    callee: {
      fromProp: p => p,
      convert: b.identifier
    },
    args: {
      fromChildren: [Literal, Identifier, Expression]
    }
  };

  protected builder = b.callExpression;

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

@JsNode.registerType()
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
      fromChild: [BlockStatement],
      default: null
    },
    params: {
      fromChildren: [
        Identifier,
        // ObjectPattern,
        // ArrayPattern,
        // RestElement,
        // AssignmentPattern,
        MemberExpression
      ]
    }
  };

  protected builder = (id, body, params) =>
    b.functionDeclaration(id, params, body || b.blockStatement([]));

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

@JsNode.registerType()
export class FunctionExpression
  extends Expression<ast.FunctionExpression, FunctionExpressionProps> {

  protected meta: JsNodeMeta = {
    id: {
      fromProp: p => p,
      convert: b.identifier,
      default: null
    },
    body: {
      fromChild: [BlockStatement],
      default: null
    },
    params: {
      fromChildren: [
        Identifier,
        // ObjectPattern,
        // ArrayPattern,
        // RestElement,
        // AssignmentPattern,
        MemberExpression
      ]
    }
  };

  protected builder = (id, body, params) =>
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

@JsNode.registerType()
@JsContainerNode()
export class BlockStatement<T extends ast.BlockStatement, P extends BlockStatementProps>
  extends Statement<T, P> {

  protected meta: JsNodeMeta = {
    statements: {
      fromChildren: [JsNode] // TODO: should be Statement
    }
  };

  protected builder = b.blockStatement;

  append: (node: GenericStatement) => this;
  insert: (index: number, node: GenericStatement) => this;
  prepend: (node: GenericStatement) => this;
}

export type GenericBlockStatement = BlockStatement<ast.BlockStatement, BlockStatementProps>;

/*========================================================================
                            Property
=========================================================================*/

export type PropertyProps = {
  key: LiteralValue | Identifier,
  value?: LiteralValue | FunctionExpression | Literal,
  kind: ast.PropertyKind,
  method?: boolean,
  shorthand?: boolean,
  computed?: boolean
};

@JsNode.registerType()
export class Property
  extends JsNode<ast.Property, PropertyProps> {

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'init'
    },
    key: {
      fromProp: p => p,
      fromChild: [Identifier],
      convert: b.identifier
    },
    value: {
      fromProp: p => p,
      fromChild: ['string', Expression/* Pattern*/],
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

export type ObjectExpressionProps = {};

@JsNode.registerType()
export class ObjectExpression
  extends JsNode<ast.ObjectExpression, ObjectExpressionProps> {

  protected meta: JsNodeMeta = {
    properties: {
      fromChildren: [Property]
    }
  };

  protected builder = b.objectExpression;
}

/*========================================================================
                            Expression Statement
=========================================================================*/

export type ExpressionStatementProps = StatementProps;

@JsNode.registerType()
export class ExpressionStatement
  extends Statement<ast.ExpressionStatement, ExpressionStatementProps> {

  protected meta: JsNodeMeta = {
    expression: {
      fromChild: [
        Identifier,
        Literal,
        CallExpression,
        AssignmentExpression,
        VariableDeclaration
      ]
    }
  };

  protected builder = b.expressionStatement;
}

/*========================================================================
                            Return Statement
=========================================================================*/

export type ReturnStatementProps = {};

@JsNode.registerType()
export class ReturnStatement extends JsNode<ast.ReturnStatement, ReturnStatementProps> {

  protected meta: JsNodeMeta = {
    expression: {
      fromChild: [
        Identifier,
        Literal,
        CallExpression,
        AssignmentExpression,
        VariableDeclaration
      ],
      default: null
    }
  };

  protected builder = (expression) => b.returnStatement(expression || null);
}

/*========================================================================
                            This Expression
=========================================================================*/

export type ThisExpressionProps = ExpressionProps;

@JsNode.registerType()
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

@JsNode.registerType()
export class MemberExpression
  extends Expression<ast.MemberExpression, MemberExpressionProps> {

  protected meta: JsNodeMeta = {
    object: {
      fromProp: p => p,
      fromChild: [Expression],
      convert: s => s === 'this' ? b.thisExpression() : b.identifier(s),
      default: b.thisExpression
    },
    property: {
      fromProp: p => p,
      fromChild: ['string', Expression],
      convert: b.identifier
    },
    computed: {
      fromProp: p => p,
      default: false
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
  right?: LiteralValue | GenericExpression
};

@JsNode.registerType()
export class AssignmentExpression
  extends Expression<ast.AssignmentExpression, AssignmentExpressionProps> {

  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p,
      default: '='
    },
    left: {
      fromProp: p => p,
      fromChild: [Identifier, MemberExpression],
      convert: b.identifier
    },
    right: {
      fromProp: p => p,
      fromChild: [Expression],
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

@JsNode.registerType()
export class ClassDeclaration<T extends ast.ClassDeclaration, P extends ClassDeclarationProps>
  extends JsNode<T, P> {

  protected meta: JsNodeMeta = {
    id: {
      fromProp: p => p,
      convert: b.identifier
    },
    superClass: {
      fromProp: p => p,
      fromChild: [Expression],
      convert: b.identifier,
      default: null
    },
    body: {
      fromProp: p => p,
      fromChild: [ClassBody],
      default: null
    },
    elements: {
      fromChildren: [
        MethodDefinition,
        VariableDeclarator,
        // ClassProperty
        // ClassPropertyDefinition
      ]
    }
  };

  protected builder = (id, superClass, body, elements) => b.classDeclaration(
    id,
    body || b.classBody(elements),
    superClass
  );

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

@JsNode.registerType()
export class ClassBody extends JsNode<ast.ClassBody, ClassBodyProps> {
  protected meta: JsNodeMeta = {
    elements: {
      fromChildren: [
        MethodDefinition,
        VariableDeclarator,
        // ClassProperty
        // ClassPropertyDefinition
      ]
    }
  };
  protected builder = b.classBody;

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

@JsNode.registerType()
export class MethodDefinition
  extends JsNode<ast.MethodDefinition, MethodDefinitionProps> {

  protected meta: JsNodeMeta = {
    kind: {
      fromProp: p => p,
      default: 'method'
    },
    key: {
      fromProp: p => p,
      fromChild: [Expression],
      convert: b.identifier
    },
    static: {
      fromProp: p => p,
      default: false
    },
    value: {
      fromProp: p => p,
      fromChild: [FunctionExpression],
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

@JsNode.registerType()
export class NewExpression extends JsNode<ast.NewExpression, NewExpressionProps> {

  protected meta: JsNodeMeta = {
    callee: {
      fromProp: p => p,
      fromChild: [Expression/*, Super*/],
      convert: b.identifier
    },
    args: {
      fromChildren: [Expression, /*SpreadElement*/]
    }
  };

  protected builder = b.newExpression;

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
  left?: string | GenericExpression,
  right?: LiteralValue | GenericExpression
};

@JsNode.registerType()
export class BinaryExpression extends JsNode<ast.BinaryExpression, BinaryExpressionProps> {
  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p,
      default: '==='
    },
    left: {
      fromProp: p => p,
      fromChild: [Expression],
      convert: b.identifier
    },
    right: {
      fromProp: p => p,
      fromChild: [Expression],
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

@JsNode.registerType()
export class ArrayExpression extends JsNode<ast.ArrayExpression, ArrayExpressionProps> {

  protected meta: JsNodeMeta = {
    elements: {
      fromChildren: [
        Expression,
        // SpreadElement,
        // RestElement
      ]
    }
  };

  protected builder = b.arrayExpression;
}

/*========================================================================
                            Import Specifier
=========================================================================*/

export type ImportSpecifierProps = {
  imported?: string | Identifier,
  local?: string | Identifier
};

@JsNode.registerType()
export class ImportSpecifier extends JsNode<ast.ImportSpecifier, ImportSpecifierProps> {
  protected meta: JsNodeMeta = {
    imported: {
      fromProp: p => p,
      fromChild: [Identifier],
      convert: b.identifier,
      default: null
    },
    local: {
      fromProp: p => p,
      fromChild: [Identifier],
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
  source: LiteralValue | Literal
};

@JsNode.registerType()
export class ImportDeclaration extends JsNode<ast.ImportDeclaration, ImportDeclarationProps> {
  protected meta: JsNodeMeta = {
    source: {
      fromProp: p => p,
      fromChild: [Literal],
      convert: b.literal
    },
    specifiers: {
      fromChildren: [JsNode]
    }
  };

  protected builder = (source, specifiers) => b.importDeclaration(specifiers, source);
}

/*========================================================================
                            Unary Expression
=========================================================================*/

export type UnaryExpressionProps = {
  operator: '!' | 'delete' | 'typeof' | 'void' | '+',
  argument?: string | GenericExpression
};

@JsNode.registerType()
export class UnaryExpression extends Expression<ast.UnaryExpression, UnaryExpressionProps> {
  protected meta: JsNodeMeta = {
    operator: {
      fromProp: p => p
    },
    argument: {
      fromProp: p => p,
      fromChild: [Expression],
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

@JsNode.registerType()
export class IfStatement extends Statement<ast.IfStatement, IfStatementProps> {
  protected meta: JsNodeMeta = {
    test: {
      fromProp: p => p,
      fromChild: [Expression]
    },
    consequent: {
      fromProp: p => p,
      fromChild: [Statement],
      default: () => b.blockStatement([])
    },
    alternate: {
      fromProp: p => p,
      fromChild: [Statement],
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

@JsNode.registerType()
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
  expression?: LiteralValue | GenericExpression
};

@JsNode.registerType()
export class JSXExpressionContainer
  extends Expression<ast.JSXExpressionContainer, JSXExpressionContainerProps> {

  protected meta: JsNodeMeta = {
    expression: {
      fromProp: p => p,
      fromChild: [Expression],
      convert: b.literal
    }
  };

  protected builder = b.jsxExpressionContainer;
}

/*========================================================================
                            JSX Attribute
=========================================================================*/

export type JSXAttributeProps = {
  name?: string | JSXIdentifier
  value?: LiteralValue | GenericExpression | JSXExpressionContainer
};

@JsNode.registerType()
export class JSXAttribute
  extends JsNode<ast.JSXAttribute, JSXAttributeProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      fromChild: [JSXIdentifier],
      convert: b.jsxIdentifier
    },
    value: {
      fromProp: p => p,
      fromChild: [Literal, JSXExpressionContainer],
      convert: b.literal,
      default: null
    }
  };

  protected builder = (name, value) => {
    // Wrap all values that are not strings, expression containers or null in
    // an expression container
    if (!value
      || value.type === 'JSXExpressionContainer'
      || typeof value.value === 'string') {
      return b.jsxAttribute(name, value);
    }
    return b.jsxAttribute(name, b.jsxExpressionContainer(value));
  }
}

/*========================================================================
                            JSX Opening Element
=========================================================================*/

export type JSXOpeningElementProps = {
  name?: string | JSXIdentifier
  selfClosing?: boolean
};

@JsNode.registerType()
export class JSXOpeningElement
  extends JsNode<ast.JSXOpeningElement, JSXOpeningElementProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      fromChild: [JSXIdentifier],
      convert: b.jsxIdentifier
    },
    attributes: {
      fromChildren: [JSXAttribute]
    },
    selfClosing: {
      fromProp: p => p,
      default: false
    }
  };

  protected builder = b.jsxOpeningElement;
}

/*========================================================================
                            JSX Closing Element
=========================================================================*/

export type JSXClosingElementProps = {
  name?: string | JSXIdentifier
};

@JsNode.registerType()
export class JSXClosingElement
  extends JsNode<ast.JSXClosingElement, JSXClosingElementProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      fromChild: [JSXIdentifier],
      convert: b.jsxIdentifier
    }
  };

  protected builder = b.jsxClosingElement;
}

/*========================================================================
                                JSX Element
=========================================================================*/

export type JSXElementProps = {
  name?: string | JSXIdentifier,
  selfClosing?: boolean
};

@JsNode.registerType()
export class JSXElement
  extends JsNode<ast.JSXElement, JSXElementProps> {

  protected meta: JsNodeMeta = {
    name: {
      fromProp: p => p,
      fromChild: [JSXIdentifier],
      convert: b.jsxIdentifier
    },
    attributes: {
      fromChildren: [JSXAttribute]
    },
    selfClosing: {
      fromProp: p => p,
      default: false
    },
    children: {
      fromChildren: ['string', Literal, JSXExpressionContainer, JSXElement],
      convert: b.literal
    }
  };

  protected builder = (name, attributes, selfClosing, children) =>
    b.jsxElement(
      b.jsxOpeningElement(name, attributes, selfClosing),
      b.jsxClosingElement(name),
      children
    );
}
