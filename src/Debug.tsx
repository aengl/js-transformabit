import { JsNode } from './JsNode';
import * as js from './JsCode';

const JsCode = js.JsCode;

console.log(
  (<js.JSXElement name='div'>
    <js.JSXAttribute name='display' value='block' />
  </js.JSXElement>).format()
);
