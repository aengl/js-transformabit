import { JsNode, JsNodeList, NamedTypes as t, Builders as b } from './JsNode';
import {
  Identifier,
  MethodDefinition,
  BlockStatement,
  VariableDeclaration,
  Literal,
  ClassBody
} from './JsCode';
import * as ast from 'ast-types';

describe('JsNodeList', () => {
  it('create', () => {
    const code = 'let foo, bar; let baz;';
    const node = JsNode.fromModuleCode(code);
    const identifiers = node.findChildrenOfType(t.Identifier);
    expect(identifiers.size()).toBe(3);
    expect(identifiers.at<ast.Identifier>(2).node().name).toBe('baz');
  });

  it('map', () => {
    const code = 'let foo, bar; let baz;';
    const identifiers = JsNode.fromModuleCode(code)
      .findChildrenOfType<ast.Identifier>(t.Identifier)
      .map(n => n.node().name)
      .join();
    expect(identifiers).toBe('foo,bar,baz');
  });

  it('filter', () => {
    const code = 'let foo, bar; let baz;';
    const identifiers = JsNode.fromModuleCode(code)
      .findChildrenOfType<ast.Identifier>(t.Identifier)
      .filter(n => n.node().name === 'bar');
    expect(identifiers.size()).toBe(1);
    expect(identifiers.at(0).format()).toBe('bar');
  });

  it('forEach', () => {
    const code = 'let foo, bar; let baz;';
    const node = JsNode.fromModuleCode(code);
    node
      .findChildrenOfType<ast.Identifier>(t.Identifier)
      .forEach(n => n.node().name = n.node().name.split('').reverse().join(''));
    expect(node.format()).toBe('let oof, rab; let zab;');
  });

  it('has', () => {
    const code = 'let foo, bar; let baz;';
    const nodes = JsNode.fromModuleCode(code)
      .findChildrenOfType<ast.Identifier>(t.Identifier);
    expect(nodes.has(n => n.node().name === 'baz')).toBe(true);
    expect(nodes.has(n => n.node().name === 'qux')).toBe(false);
  });

  it('push', () => {
    const code = 'let foo, bar; let baz;';
    const nodes = JsNode.fromModuleCode(code)
      .findChildrenOfType<ast.Identifier>(t.Identifier);
    const list = new JsNodeList();
    list.push(nodes.at(1));
    list.pushPath(nodes.at(0).path());
    expect(list.size()).toBe(2);
    expect(list.at(0).format()).toBe('bar');
    expect(list.at(1).format()).toBe('foo');
  });

  it('remove all', () => {
    const code = 'let foo = 23, bar = 42;';
    let node = JsNode.fromModuleCode(code);
    node
      .findChildrenOfType(t.Literal)
      .removeAll();
    expect(node.format()).toBe('let foo, bar;');
  });

  it('to array', () => {
    const code = 'let foo, bar; let baz;';
    const nodes = JsNode.fromModuleCode(code)
      .findChildrenOfType<ast.Identifier>(t.Identifier)
      .toArray();
    expect(nodes.length).toBe(3);
    expect(nodes[0].format()).toBe('foo');
    expect(nodes[1].format()).toBe('bar');
    expect(nodes[2].format()).toBe('baz');
  });
});

describe('JsNode', () => {
  it('create & print', () => {
    const code = 'const foo = 42;';
    expect(JsNode.fromModuleCode(code).format()).toBe(code);
  });

  it('create from module', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    expect(node.check(t.File)).toBe(true);
  });

  it('create from code', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromCode(code).at(0);
    expect(node.check(t.VariableDeclaration)).toBe(true);
  });

  it('create from expression statement', () => {
    const code = '<div>foo!</div>';
    const node = JsNode.fromExpressionStatement(code);
    expect(node.format()).toBe(code);
  });

  it('create from function body', () => {
    const code = 'let foo = 42; return foo;';
    const nodes = JsNode.fromFunctionBody(code);
    expect(nodes.at(1).format()).toBe('return foo;');
  });

  it('find child', () => {
    const code = 'const foo = 42, bar = 23;';
    const node = JsNode.fromModuleCode(code);
    const identifiers = node.findChildrenOfType(t.Identifier);
    expect(identifiers.size()).toBe(2);
    expect(identifiers.at(0).format()).toBe('foo');
    expect(identifiers.at(1).format()).toBe('bar');
  });

  it('chain find calls', () => {
    const code = 'class Foo { bar() {} };';
    const node = JsNode.fromModuleCode(code);
    const method = node.findFirstChildOfType(MethodDefinition);
    expect(method.format()).toBe('bar() {}');
    const block = method.findFirstChildOfType(BlockStatement);
    expect(block.format()).toBe('{}');
  });

  it('find closest parent', () => {
    const code = 'class Foo { bar() {} }';
    const node = JsNode.fromModuleCode(code);
    const method = node.findFirstChildOfType(MethodDefinition);
    expect(method.format()).toBe('bar() {}');
    const program = method.findClosestParentOfType(t.Program);
    expect(program.format()).toBe(code);
  });

  it('find closest scope', () => {
    const code = 'function foo() { const foo = 42; }';
    const node = JsNode.fromModuleCode(code)
      .findFirstChildOfType(VariableDeclaration)
      .findClosestScope();
    expect(node.type()).toBe(t.FunctionDeclaration.toString());
    expect(node.format()).toBe(code);
  });

  it('descend', () => {
    const code = 'const foo = 42;';
    let node = JsNode.fromCode(code).at(0).descend();
    expect(node.format()).toBe('foo = 42');
    node = JsNode.fromModuleCode(code).descend(node => node.check(t.Literal));
    expect(node.format()).toBe('42');
  });

  it('ascend', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code).findFirstChildOfType(Literal);
    expect(node.ascend().format()).toBe('foo = 42');
    expect(node.ascend(node => node.check(t.Program)).format()).toBe(code);
  });

  it('get root', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    const literal = node.findFirstChildOfType(Literal);
    expect(literal.format()).toBe('42');
    expect(literal.getRoot().format()).toBe(code);
  });

  it('replace', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    node
      .findFirstChildOfType(Literal)
      .replace(b['literal'](23));
    expect(node.format()).toBe(code.replace('42', '23'));
  });

  it('remove', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    node
      .findFirstChildOfType(Literal)
      .remove();
    expect(node.format()).toBe('const foo;');
  });

  it('get children', () => {
    const code = 'class Foo { bar() { return 23; } baz() { return 42; } }';
    const node = JsNode.fromModuleCode(code);
    const children = node
      .findFirstChildOfType(ClassBody)
      .children();
    expect(children.size()).toBe(2);
    expect(children.at(0).format()).toBe('bar() { return 23; }');
    expect(children.at(1).format()).toBe('baz() { return 42; }');
  });

  it('remove children', () => {
    const code = 'class Foo { bar() { return 23; } baz() { return 42; } }';
    const node = JsNode.fromModuleCode(code);
    node
      .findFirstChildOfType(ClassBody)
      .removeChildren();
    expect(node.format()).toBe('class Foo {}');
  });

  it('remove ancestors', () => {
    const code = 'class Foo { bar() { return 23; } baz() { return 42; } }';
    const node = JsNode.fromModuleCode(code);
    node.removeDescendants(node => node.check(t.ReturnStatement));
    expect(node.format()).toBe('class Foo { bar() {} baz() {} }');
  });
});
