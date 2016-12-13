import {
  JsCode,
  ReturnStatement,
  CallExpression,
  MethodDefinition,
  BlockStatement,
  Literal,
  Identifier,
  VariableDeclaration,
  ReactComponent,
  ReactClassComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  ReactComponentEventHandler
} from '../JsCode';

import { JsNode, GenericJsNode, JsNodeFactory } from '../JsNode';
import { DemoEditor } from './editor';

let node: GenericJsNode = (
  <ReactClassComponent name='MyComponent'>
    <ReactComponentRender>
      {'<h1>Trifork ftw!</h1>'}
    </ReactComponentRender>
    <ReactComponentEventHandler name='handleLife'>
      {JsNode.fromFunctionBody('return 42;').at(0)}
    </ReactComponentEventHandler>
  </ReactClassComponent>
) as GenericJsNode;

node = new DemoEditor().apply(node as GenericJsNode, null);

// node = JsNode.fromModuleCode(
// `class Foo {
//   bar() {
//     let baz = 42;
//     return baz;
//   }
// }`);

// let id = node.findFirstChildOfType(Identifier);
// id.name = 'FOO';

console.log(node.format());
