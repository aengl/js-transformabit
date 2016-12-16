import {
  JsCode,
  ReturnStatement,
  CallExpression,
  MethodDefinition,
  BlockStatement,
  MemberExpression,
  Literal,
  Identifier,
  VariableDeclaration,
  ReactComponent,
  ReactClassComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  ReactComponentEventHandler,
  ClassDeclaration
} from '../JsCode';

import { JsNode, GenericJsNode } from '../JsNode';
import { DemoEditor } from './editor';
import { BindWebSocket } from '../transformations/BindWebSocket';

let node = (
  <ReactClassComponent id='MyComponent'>
    <ReactComponentRender>
      {'<h1>Trifork ftw!</h1>'}
    </ReactComponentRender>
    <ReactComponentEventHandler name='handleLife'>
      {JsNode.fromFunctionBody('return 42;').at(0)}
    </ReactComponentEventHandler>
  </ReactClassComponent>
) as ReactClassComponent;
// console.log(node.format());

// Demo: format and re-parse
// node = JsNode.fromCode(node.format()).at(0) as any;

// Demo: finding complex components
// console.log(node.findFirstChildOfType(ReactComponentRender).format());

// Demo: editor
// new DemoEditor().apply(node, null);
// console.log(node.format());

// Demo: add constructor
// console.log(node.createConstructor().format());

// Demo: bind web sockets
let t = new BindWebSocket();
t.configure(['MyComponent', 'foo']);
t.apply(node, null);
console.log(node.format());

// Demo: type guards
// if (node.check(ClassDeclaration)) {
//   let superClass = node.superClass();
//   if (superClass.check(MemberExpression)) {
//     let object = superClass.object();
//     if (object.check(Identifier)) {
//       console.log(object.name);
//     }
//   }
// }

// Demo: type specific methods
// console.log(node.getRenderMethod().format());
