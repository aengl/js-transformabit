import {JsNode} from './JsNode';
import * as proptypes from './PropTypes';

describe('InferTypes', () => {
  it('constants', () => {
    const int = JsNode.fromModuleCode("function test() {this.props.age = 88;}");
    const str = JsNode.fromModuleCode("this.props.name = 'Blair';");
    const bool = JsNode.fromModuleCode("this.props.verbose = true;");

    expect(proptypes.inferPropType(int, "age")).toBe("number");
    expect(proptypes.inferPropType(str, "name")).toBe("string");
    expect(proptypes.inferPropType(bool, "verbose")).toBe("boolean");
  });

  it('complex types', () => {
    const array = JsNode.fromModuleCode("this.props.list[8] = 4;");
    const arrayAssigned = JsNode.fromModuleCode("this.props.nums = [0, 1, 2, 3];");
    const object = JsNode.fromModuleCode("this.props.settings = {a: true, b: false};");

    expect(proptypes.inferPropType(array, "list")).toBe("array");
    expect(proptypes.inferPropType(arrayAssigned, "nums")).toBe("array");
    expect(proptypes.inferPropType(object, "settings")).toBe("object");
  });

  it('function', () => {
    const a = JsNode.fromModuleCode("this.props.mapper = function () {return true};");
    const b = JsNode.fromModuleCode("this.props.mapper = function (foo) {return foo * 3};");
   // const c = JsNode.fromModuleCode("this.props.mapper = () => {return 'hej'});");

    expect(proptypes.inferPropType(a, "mapper")).toBe("func");
    expect(proptypes.inferPropType(b, "mapper")).toBe("func");
   // expect(proptypes.inferPropType(c, "mapper")).toBe("func");
  });

  it('function', () => {
    const a = JsNode.fromModuleCode("this.props.foo = new Foo();");
 //   const b = JsNode.fromModuleCode("this.props.foo = new Foo.Bar();");

    expect(proptypes.inferPropType(a, "foo")).toBe("instanceOf(Foo)");
  //  expect(proptypes.inferPropType(b, "foo")).toBe("instanceOf(Foo.Bar)");

  });
});
