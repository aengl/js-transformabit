import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import * as ast from 'ast-types';

class ReactComponentCommon<T extends ast.Node> extends JsNode<T> {
  protected getRenderBodyFromChildren(children: GenericJsNode[]): JsNode<ast.Expression> {
    for (let child of children) {
      if (child instanceof ReactComponentRender) {
        return child;
      }
    }
  }
}

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent extends ReactComponentCommon<ast.VariableDeclaration> {
  props: ReactStatelessComponentProps;

  constructor(props: ReactStatelessComponentProps, children: GenericJsNode[]) {
    super();
    let body = this.getRenderBodyFromChildren(children);
    this._node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          body ? body.node() : null
        )
      )
    ]);
  }
}

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent extends ReactComponentCommon<ast.VariableDeclaration> {
  props: ReactComponentProps;

  constructor(props: ReactComponentProps, children: GenericJsNode[]) {
    super();
    let body = this.getRenderBodyFromChildren(children);
    let renderMethod = b.property('init', b.identifier('render'),
      b.functionExpression(null, [], b.blockStatement([
        b.returnStatement(body ? body.node() : null)
      ]))
    );
    renderMethod.method = true;
    this._node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.callExpression(
          b.memberExpression(b.identifier('React'), b.identifier('createClass')),
          [b.objectExpression([renderMethod])]
        )
      )
    ]);
  }
}

export type ReactClassComponentProps = {
  name: string;
};

export class ReactClassComponent extends ReactComponentCommon<ast.ClassDeclaration> {
  props: ReactClassComponentProps;

  constructor(props: ReactClassComponentProps, children: GenericJsNode[]) {
    super();
    let body = this.getRenderBodyFromChildren(children);
    this._node = b.classDeclaration(
      b.identifier(props.name),
      b.classBody([
        b.methodDefinition(
          'method',
          b.identifier('render'),
          b.functionExpression(
            null,
            [],
            b.blockStatement([
              b.returnStatement(body ? body.node() : null)
            ])
          )
        )
      ]),
      b.memberExpression(
        b.identifier('React'),
        b.identifier('Component')
      )
    );
  }
}

export class ReactComponentRenderProps {
}

export class ReactComponentRender extends JsNode<any> {
  props: ReactComponentRenderProps;

  constructor(props: ReactComponentRenderProps, children: string[]) {
    if (children.length !== 1) {
      throw new Error('ReactComponentRender requires exactly one child');
    }
    const renderBody = children[0];
    if (typeof renderBody !== 'string') {
      throw new Error('ReactComponentRender only accepts strings as children');
    }
    super(
      JsNode.fromExpressionStatement(renderBody).node()
    );
  }
}
