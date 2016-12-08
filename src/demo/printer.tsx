import {
  JsCode,
  ReactComponent,
  ReactClassComponent,
  ReactStatelessComponent,
  ReactComponentRender
} from '../JsCode';

import { JsNode, GenericJsNode } from '../JsNode';

let node = (
  <ReactClassComponent name='MyComponent'>
    <ReactComponentRender>
      {'<h1>Trifork ftw!</h1>'}
    </ReactComponentRender>
  </ReactClassComponent>
);

console.log(node.format());
