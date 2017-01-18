import { JsNode } from './JsNode';
import * as js from './JsCode';

const JsCode = js.JsCode;

console.log(
  (<js.ObjectExpression />).format()
);
