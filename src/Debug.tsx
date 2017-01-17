import * as js from './JsCode';

const JsCode = js.JsCode;

const node = (
  <js.IfStatement>
    <js.Literal value='42' />
    <js.BlockStatement />
  </js.IfStatement>
);

console.log(node.format());
