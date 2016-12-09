import {
  JsCode,
  ReturnStatement,
  Literal,
  ReactComponent,
  ReactClassComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  ReactComponentEventHandler
} from '../JsCode';

import { JsNode, GenericJsNode } from '../JsNode';
import { ExampleEditor } from './editor';

let node = (
  <ReactClassComponent name='MyComponent'>
    <ReactComponentRender>
      {'<h1>Trifork ftw!</h1>'}
    </ReactComponentRender>
    <ReactComponentEventHandler name='handleLife'>
      {JsNode.fromFunctionBody('return 42;').at(0)}
    </ReactComponentEventHandler>
  </ReactClassComponent>
);

node = new ExampleEditor().apply(node as GenericJsNode, null);

console.log(node.format());
