import { JsNode } from './JsNode';
import * as js from './JsCode';

const JsCode = js.JsCode;

const program = JsNode
  .fromModuleCode('')
  .findFirstChildOfType(js.Program);
let node = JsNode.fromCode<js.GenericStatement>('let foo;').first();
console.log(program.append(node).format());
node = JsNode.fromCode<js.GenericStatement>('let bar;').first();
console.log(program.prepend(node).format());
node = JsNode.fromCode<js.GenericStatement>('let baz;').first();
console.log(program.insert(1, node).format());
