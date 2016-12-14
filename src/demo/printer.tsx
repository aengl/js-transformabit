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

let node: GenericJsNode = (
  <ReactClassComponent id='MyComponent'>
    <ReactComponentRender>
      {'<h1>Trifork ftw!</h1>'}
    </ReactComponentRender>
    <ReactComponentEventHandler name='handleLife'>
      {JsNode.fromFunctionBody('return 42;').at(0)}
    </ReactComponentEventHandler>
  </ReactClassComponent>
) as GenericJsNode;

// node = new DemoEditor().apply(node as GenericJsNode, null);

// console.log(node.format());

if (node.check(ClassDeclaration)) {
  let superClass = node.superClass();
  if (superClass.check(MemberExpression)) {
    let object = superClass.object();
    if (object.check(Identifier)) {
      console.log(object.name);
    }
  }
}
