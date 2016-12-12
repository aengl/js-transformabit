import {
  JsCode,
  ReturnStatement,
  Literal,
  Identifier,
  ReactComponent,
  ReactClassComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  ReactComponentEventHandler
} from '../JsCode';

import { JsNode, GenericJsNode } from '../JsNode';
// import { DemoEditor } from './editor';

// let node = (
//   <ReactClassComponent name='MyComponent'>
//     <ReactComponentRender>
//       {'<h1>Trifork ftw!</h1>'}
//     </ReactComponentRender>
//     <ReactComponentEventHandler name='handleLife'>
//       {JsNode.fromFunctionBody('return 42;').at(0)}
//     </ReactComponentEventHandler>
//   </ReactClassComponent>
// );

// node = new DemoEditor().apply(node as GenericJsNode, null);

let node = JsNode.fromModuleCode(
`class Foo {
  bar() {
    let baz = 42;
    return baz;
  }
}`);

let id = node.findFirstChildOfType(Identifier);

console.log(node.format());
