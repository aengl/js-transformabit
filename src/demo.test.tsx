import {
  VariableDeclaration,
  VariableDeclarator,
  VariableKind,
  Literal,
  Identifier,
  CallExpression,
  BlockStatement,
  FunctionDeclaration,
  ExpressionStatement,
  ReturnStatement,
  JsCode
} from './JsCode';

import { JsNode } from './jsnode';
import { namedTypes as t } from 'ast-types';

describe('demo', () => {
  it('insert into method body', () => {
    let code =
`class Foo {
  bar() {}
}`;
    let expectedCode =
`class Foo {
  bar() {
    let baz = 42;
    return baz;
  }
}`;
    let node = JsNode.fromModuleCode(code);
    node
      .findFirstChildOfType(t.MethodDefinition)
      .findFirstChildOfType(t.BlockStatement)
      .replace(
        <BlockStatement>
          <VariableDeclaration name='baz' kind={VariableKind.Let}>
            <Literal value={42}/>
          </VariableDeclaration>
          <ReturnStatement>
            <Identifier name='baz' />
          </ReturnStatement>
        </BlockStatement>
      );
    expect(node.format()).toBe(expectedCode);
  });
});
