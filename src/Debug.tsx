import { JsNode } from './JsNode';
import * as js from './JsCode';

const JsCode = js.JsCode;

console.log(
  (<js.Property key='render' kind='init'>
    <js.FunctionExpression />
  </js.Property>
  ).format()
);
