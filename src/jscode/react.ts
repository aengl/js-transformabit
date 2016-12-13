import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import { Statement } from './js';
import * as ast from 'ast-types';

class ReactComponentCommon<T extends ast.Node, P> extends JsNode<T, P> {
  protected getRenderBodyFromChildren(children: GenericJsNode[]): ast.Expression {
    const body = this._find(children, ReactComponentRender);
    if (body) {
      return body.node as ast.Expression;
    }
    return null;
  }

  protected getEventHandlersFromChildren(
    children: GenericJsNode[]): ReactComponentEventHandler[] {

    return children.filter(child =>
      child instanceof ReactComponentEventHandler) as ReactComponentEventHandler[];
  }
}

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent
  extends ReactComponentCommon<ast.VariableDeclaration, ReactStatelessComponentProps> {

  build(props: ReactStatelessComponentProps,
    children: GenericJsNode[]): ReactStatelessComponent {

    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          this.getRenderBodyFromChildren(children)
        )
      )
    ]);
    return super.build(props, children) as ReactStatelessComponent;
  }
}

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent
  extends ReactComponentCommon<ast.VariableDeclaration, ReactComponentProps> {

  build(props: ReactComponentProps, children: GenericJsNode[]): ReactComponent {
    // Create event handlers
    let eventHandlers = this.getEventHandlersFromChildren(children)
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
        b.returnStatement(this.getRenderBodyFromChildren(children))
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

export type ReactClassComponentProps = {
  name: string;
};

export class ReactClassComponent
  extends ReactComponentCommon<ast.ClassDeclaration, ReactClassComponentProps> {

  build(props: ReactClassComponentProps, children: GenericJsNode[]): ReactClassComponent {
    // Create event handlers
    let eventHandlers = this.getEventHandlersFromChildren(children)
      .map(handler => b.methodDefinition(
        'method',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
    );
    // Create AST
    this.node = b.classDeclaration(
      b.identifier(props.name),
      b.classBody([
        b.methodDefinition(
          'method',
          b.identifier('render'),
          b.functionExpression(
            null,
            [],
            b.blockStatement([
              b.returnStatement(this.getRenderBodyFromChildren(children))
            ])
          )
        )
      ].concat(eventHandlers)),
      b.memberExpression(
        b.identifier('React'),
        b.identifier('Component')
      )
    );
    return super.build(props, children) as ReactClassComponent;
  }

  getRenderBody(): JsNode<ast.FunctionExpression, any> {
    return null;
    // TODO
    // return this
    //   .findChildrenOfType<ast.MethodDefinition>(t.MethodDefinition)
    //   .filter(node => node.getMethodName() === 'render');
  }
}

export class ReactComponentRenderProps {
}

export class ReactComponentRender extends JsNode<any, ReactComponentRenderProps> {
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

export class ReactComponentEventHandlerProps {
  name: string;
}

export class ReactComponentEventHandler
  extends JsNode<any, ReactComponentEventHandlerProps> {

  build(props: ReactComponentEventHandlerProps,
    children: Statement[]): ReactComponentEventHandler {

    this.node = b.blockStatement(children.map(child => child.node));
    return super.build(props, children);
  }
}
