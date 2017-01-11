import { JsNode, JsNodeType, GenericJsNode } from '../JsNode';
import * as js from './js';
import { ast } from '../../deps/bundle';

const b = ast.builders;

function find(children: GenericJsNode[], type: JsNodeType<any>): GenericJsNode {
  for (let child of children) {
    if (child instanceof type) {
      return child;
    }
  }
  return null;
}

function getRenderBodyFromChildren(children: GenericJsNode[]): ast.Expression {
  const body = find(children, ReactComponentRender);
  if (body) {
    return body.node as ast.Expression;
  }
  return null;
}

function getEventHandlersFromChildren(children: GenericJsNode[]): ReactComponentEventHandler[] {
  return children.filter(child =>
    child instanceof ReactComponentEventHandler) as ReactComponentEventHandler[];
}

/** ----------------------------------------------------------------------------
 * Stateless Component
 */

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent
  extends JsNode<ast.VariableDeclaration, ReactStatelessComponentProps> {

  build(props: ReactStatelessComponentProps,
    children: GenericJsNode[]): this {

    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          getRenderBodyFromChildren(children)
        )
      )
    ]);
    return super.build(props, children) as this;
  }
}

/** ----------------------------------------------------------------------------
 * Component (React.createClass(...))
 */

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent
  extends js.VariableDeclaration<ast.VariableDeclaration, ReactComponentProps> {

  static check(node: GenericJsNode): boolean {
    if (node instanceof js.VariableDeclaration) {
      const callExp = node.findFirstChildOfType(js.CallExpression);
      if (callExp) {
        return callExp.callee().format() === 'React.createClass';
      }
    }
    return false;
  }

  get name(): string {
    return this.declarations().first().name;
  }

  set name(value: string) {
    this.declarations().first().name = value;
  }

  build(props: ReactComponentProps, children: GenericJsNode[]): this {
    // Create event handlers
    const eventHandlers = getEventHandlersFromChildren(children)
      .map(handler => b.property(
        'init',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
    );
    eventHandlers.forEach(handler => handler.method = true);
    // Create render method
    const renderMethod = b.property('init', b.identifier('render'),
      b.functionExpression(null, [], b.blockStatement([
        b.returnStatement(getRenderBodyFromChildren(children))
      ]))
    );
    renderMethod.method = true;
    // Create AST
    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.callExpression(
          b.memberExpression(b.identifier('React'), b.identifier('createClass')),
          [b.objectExpression([renderMethod].concat(eventHandlers))]
        )
      )
    ]);
    return this;
  }

  findConstructor(): js.MethodDefinition {
    throw 'TODO';
    // return this
    //   .findChildrenOfType(js.MethodDefinition, m => m.kind === 'constructor')
    //   .first();
  }

  createConstructor(): this {
    throw 'TODO';
    // this.findFirstChildOfType(ClassBody).createConstructor();
    // return this;
  }

  convertToReactClassComponent() {
    const methods = this
      .findFirstChildOfType(js.ObjectExpression)
      .children<js.Property>()
      .map(prop => b.methodDefinition(
        'method',
        b.identifier(prop.key().name),
        b.functionExpression(
          null,
          prop.findFirstChildOfType(js.FunctionExpression).params().nodes<ast.Pattern>(),
          prop.findFirstChildOfType(js.BlockStatement).node
        )
      ));
    const className = this.declarations().first().id().name;
    this.replace(
      b.classDeclaration(
        b.identifier(className),
        b.classBody(methods),
        b.memberExpression(
          b.identifier('React'),
          b.identifier('Component')
        )
      )
    );
    return this.convert(ReactClassComponent);
  }
}

/** ----------------------------------------------------------------------------
 * Class Component
 */

export type ReactClassComponentProps = js.ClassDeclarationProps;

export class ReactClassComponent
  extends js.ClassDeclaration<ast.ClassDeclaration, ReactClassComponentProps> {

  static check(node: GenericJsNode): boolean {
    return (node instanceof js.ClassDeclaration) && (
      node.superClass().format() === 'React.Component' ||
      node.superClass().format() === 'Component'
    );
  }

  build(props: ReactClassComponentProps, children: GenericJsNode[]): this {
    // Create event handlers
    let eventHandlers = getEventHandlersFromChildren(children)
      .map(handler => b.methodDefinition(
        'method',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
      );
    // Create AST
    this.node = b.classDeclaration(
      b.identifier(typeof props.id === 'string' ? props.id : props.id.name),
      b.classBody([
        b.methodDefinition(
          'method',
          b.identifier('render'),
          b.functionExpression(
            null,
            [],
            b.blockStatement([
              b.returnStatement(getRenderBodyFromChildren(children))
            ])
          )
        )
      ].concat(eventHandlers)),
      b.memberExpression(
        b.identifier('React'),
        b.identifier('Component')
      )
    );
    return this;
  }

  getRenderMethod() {
    const methods = this
      .findChildrenOfType(js.MethodDefinition)
      .filter(node => node.methodName() === 'render');
    if (methods.size() > 0) {
      return methods.at(0);
    }
  }

  convertToReactComponent() {
    let methods = this.findChildrenOfType(js.MethodDefinition, node => node.kind === 'method');
    let properties: ast.Property[] = methods.map(method =>
      b.property('init', b.identifier(method.methodName()),
        b.functionExpression(
          null,
          method.methodArgs().map(m => m.node),
          method.body().node as ast.BlockStatement
        )
      )
    );
    properties.forEach(property => property.method = true);
    this.replace(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          b.identifier(this.id().name),
          b.callExpression(
            b.memberExpression(b.identifier('React'), b.identifier('createClass')),
            [b.objectExpression(properties)]
          )
        )
      ])
    );
    return this.convert(ReactComponent);
  }
}

/** ----------------------------------------------------------------------------
 * Render Function
 */

export class ReactComponentRenderProps {
}

export class ReactComponentRender extends JsNode<any, ReactComponentRenderProps> {
  static check(node: GenericJsNode): boolean {
    return node instanceof js.MethodDefinition && node.methodName() === 'render';
  }

  build(props: ReactComponentRenderProps, children: string[]): this {
    if (children.length !== 1) {
      throw new Error('ReactComponentRender requires exactly one child');
    }
    const renderBody = children[0];
    if (typeof renderBody !== 'string') {
      throw new Error('ReactComponentRender only accepts strings as children');
    }
    this.node = JsNode.fromExpressionStatement(renderBody).node;
    return super.build(props, children) as this;
  }
}

/** ----------------------------------------------------------------------------
 * Event Handler
 */

export class ReactComponentEventHandlerProps {
  name: string;
}

export class ReactComponentEventHandler
  extends JsNode<any, ReactComponentEventHandlerProps> {

  static check(node: GenericJsNode): boolean {
    return node instanceof js.MethodDefinition
      && node.kind === 'method'
      && node.methodName() !== 'render';
  }

  build(props: ReactComponentEventHandlerProps,
    children: js.GenericStatement[]): this {

    this.node = b.blockStatement(children.map(child => child.node));
    return super.build(props, children) as this;
  }
}
