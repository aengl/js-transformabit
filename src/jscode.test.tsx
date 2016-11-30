import {VariableDeclaration, Literal, Identifier} from './jscode'

import {JsNode} from './jsnode';
import * as ast from 'ast-types';
import { JsBuilder , VariableKind} from './jsbuilder';

class React {

  static createElement(...args: any[]): JsNode {
    let [func, props, ...children] = args;
    return new args[0](args[1], children);
  }
}


describe('jsnodex', () => {
    it('test', () => {
      let foo = <VariableDeclaration name="foobar"><Literal value="3"/><Identifier value="3"/></VariableDeclaration> as VariableDeclaration
    });

  });
