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
  ReactComponentEventHandler,
  ClassDeclaration
} from '../JsCode';

import { JsNode, GenericJsNode } from '../JsNode';
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

// node = new DemoEditor().apply(node as GenericJsNode, null);

// console.log(node.format());

if (node.check(ClassDeclaration)) {
  console.log(node);
}
