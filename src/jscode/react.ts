import { JsNode, JsNodeType, GenericJsNode } from '../JsNode';
import {
  Statement,
  MethodDefinition,
  ClassDeclaration,
  ClassDeclarationProps,
  MethodKind
} from './js';
import * as ast from 'ast-types';

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
    children: GenericJsNode[]): ReactStatelessComponent {

    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          getRenderBodyFromChildren(children)
        )
      )
    ]);
    return super.build(props, children) as ReactStatelessComponent;
  }
}

/** ----------------------------------------------------------------------------
 * Component (React.createClass(...))
 */

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent
  extends JsNode<ast.VariableDeclaration, ReactComponentProps> {

  build(props: ReactComponentProps, children: GenericJsNode[]): ReactComponent {
    // Create event handlers
    let eventHandlers = getEventHandlersFromChildren(children)
      .map(handler => b.property(
        'init',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
      );
    eventHandlers.forEach(handler => handler.method = true);
    // Create render method
    let renderMethod = b.property('init', b.identifier('render'),
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
    return super.build(props, children) as ReactComponent;
  }
}

/** ----------------------------------------------------------------------------
 * Class Component
 */

export type ReactClassComponentProps = ClassDeclarationProps;

export class ReactClassComponent
  extends ClassDeclaration<ast.ClassDeclaration, ReactClassComponentProps> {

  static check(node: GenericJsNode): boolean {
    return node.check(ClassDeclaration)
      && node.superClass().format() === 'React.Component';
  }

  build(props: ReactClassComponentProps, children: GenericJsNode[]): ReactClassComponent {
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
      .findChildrenOfType(MethodDefinition)
      .filter(node => node.methodName() === 'render');
    if (methods.size() > 0) {
      return methods.at(0);
    }
  }

  convertToReactComponent() {
    let methods = this.findChildrenOfType(MethodDefinition,
      node => node.kind === MethodKind.Method.toString());
    let properties: ast.Property[] = methods.map(method =>
      b.property('init', b.identifier(method.methodName()),
        b.functionExpression(
          null,
          method.methodArgs().map(m => m.node),
          method.body().node
        )
      )
    );
    properties.forEach(property => property.method = true);
    return this.replace(
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
  }
}

/** ----------------------------------------------------------------------------
 * Render Function
 */

export class ReactComponentRenderProps {
}

export class ReactComponentRender extends JsNode<any, ReactComponentRenderProps> {
  static check(node: GenericJsNode): boolean {
    return node.check(MethodDefinition)
      && node.methodName() === 'render';
  }

  build(props: ReactComponentRenderProps, children: string[]): ReactComponentRender {
    if (children.length !== 1) {
      throw new Error('ReactComponentRender requires exactly one child');
    }
    const renderBody = children[0];
    if (typeof renderBody !== 'string') {
      throw new Error('ReactComponentRender only accepts strings as children');
    }
    this.node = JsNode.fromExpressionStatement(renderBody).node;
    return super.build(props, children) as ReactComponentRender;
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
    return node.check(MethodDefinition)
      && node.kind === MethodKind.Method.toString()
      && node.methodName() !== 'render';
  }

  build(props: ReactComponentEventHandlerProps,
    children: Statement[]): ReactComponentEventHandler {

    this.node = b.blockStatement(children.map(child => child.node));
    return super.build(props, children);
  }
}
