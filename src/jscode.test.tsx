import { VariableDeclaration, Literal, Identifier } from './jscode';
import { JsNode, GenericJsNode } from './jsnode';
import { JsBuilder , VariableKind} from './jsbuilder';
import * as ast from 'ast-types';

class JsCode {
  static createElement(...args: any[]): GenericJsNode {
    let [func, props, ...children] = args;
    return new args[0](args[1], children);
  }
}

describe('jsnodex', () => {
  it('test', () => {
    let foo = (
      <VariableDeclaration name='foobar'>
        <Identifier value='42'/>
      </VariableDeclaration>
    ) as VariableDeclaration;
    expect(foo.format()).toBe('let foobar = 42;');
  });
});
