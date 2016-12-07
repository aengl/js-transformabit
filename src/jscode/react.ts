import { JsNode, GenericJsNode, NamedTypes as t, Builders as b } from '../JsNode';
import * as ast from 'ast-types';

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent extends JsNode<ast.VariableDeclaration> {
  props: ReactStatelessComponentProps;

  constructor(props: ReactStatelessComponentProps) {
    let prop = b.property('init', b.identifier('render'),
      b.functionExpression(null, [], b.blockStatement([]))
    );
    prop.method = true;
    super(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          b.identifier(props.name),
          b.arrowFunctionExpression(
            [b.identifier('props')],
            b.blockStatement([])
          )
        )
      ])
    );
  }
}

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent extends JsNode<ast.VariableDeclaration> {
  props: ReactComponentProps;

  constructor(props: ReactComponentProps) {
    let prop = b.property('init', b.identifier('render'),
      b.functionExpression(null, [], b.blockStatement([]))
    );
    prop.method = true;
    super(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          b.identifier(props.name),
          b.callExpression(
            b.memberExpression(b.identifier('React'), b.identifier('createClass')),
            [b.objectExpression([prop])]
          )
        )
      ])
    );
  }
}

export type ReactClassComponentProps = {
  name: string;
};

export class ReactClassComponent extends JsNode<ast.ClassDeclaration> {
  props: ReactClassComponentProps;

  constructor(props: ReactClassComponentProps) {
    super(
      b.classDeclaration(
        b.identifier(props.name),
        b.classBody([
          b.methodDefinition(
            'method',
            b.identifier('render'),
            b.functionExpression(
              null,
              [],
              b.blockStatement([])
            )
          )
        ]),
        b.memberExpression(
          b.identifier('React'),
          b.identifier('Component')
        )
      )
    );
  }
}
