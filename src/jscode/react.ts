import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import { Statement } from './js';
import * as ast from 'ast-types';

class ReactComponentCommon<T extends ast.Node, P> extends JsNode<T, P> {
  protected getRenderBodyFromChildren(children: GenericJsNode[]): ast.Expression {
    const body = this._find(children, ReactComponentRender);
    if (body) {
      return body.node() as ast.Expression;
    }
    return null;
  }

  protected getEventHandlersFromChildren(children: GenericJsNode[]): ReactComponentEventHandler[] {
    return children.filter(child => child instanceof ReactComponentEventHandler) as ReactComponentEventHandler[];
  }
}

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent
  extends ReactComponentCommon<ast.VariableDeclaration, ReactStatelessComponentProps> {

  constructor(props: ReactStatelessComponentProps, children: GenericJsNode[]) {
    super(props);
    this.initialise(b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          this.getRenderBodyFromChildren(children)
        )
      )
    ]));
  }
}

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent
  extends ReactComponentCommon<ast.VariableDeclaration, ReactComponentProps> {

  constructor(props: ReactComponentProps, children: GenericJsNode[]) {
    super(props);
    // Create event handlers
    let eventHandlers = this.getEventHandlersFromChildren(children)
      .map(handler => b.property(
        'init',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node())
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
    this.initialise(b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.callExpression(
          b.memberExpression(b.identifier('React'), b.identifier('createClass')),
          [b.objectExpression([renderMethod].concat(eventHandlers))]
        )
      )
    ]));
  }
}

export type ReactClassComponentProps = {
  name: string;
};

export class ReactClassComponent
  extends ReactComponentCommon<ast.ClassDeclaration, ReactClassComponentProps> {

  constructor(props: ReactClassComponentProps, children: GenericJsNode[]) {
    super(props);
    // Create event handlers
    let eventHandlers = this.getEventHandlersFromChildren(children)
      .map(handler => b.methodDefinition(
        'method',
        b.identifier(handler.props.name),
        b.functionExpression(null, [b.identifier('event')], handler.node())
      )
    );
    // Create AST
    this.initialise(b.classDeclaration(
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
    ));
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

  constructor(props: ReactComponentRenderProps, children: string[]) {
    super(props);
    if (children.length !== 1) {
      throw new Error('ReactComponentRender requires exactly one child');
    }
    const renderBody = children[0];
    if (typeof renderBody !== 'string') {
      throw new Error('ReactComponentRender only accepts strings as children');
    }
    this.initialise(JsNode.fromExpressionStatement(renderBody).node());
  }
}

export class ReactComponentEventHandlerProps {
  name: string;
}

export class ReactComponentEventHandler
  extends JsNode<any, ReactComponentEventHandlerProps> {

  constructor(props: ReactComponentEventHandlerProps, children: Statement[]) {
    super(props);
    this.initialise(b.blockStatement(children.map(child => child.node())));
  }
}
