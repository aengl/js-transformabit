import { JsNode, NamedTypes as t, Builders } from './JsNode';
import { Identifier } from 'ast-types';

describe('JsNodeCollection', () => {
  it('create', () => {
    const code = 'let foo, bar; let baz;';
    const node = JsNode.fromModuleCode(code);
    const identifiers = node.findChildrenOfType(t.Identifier);
    expect(identifiers.size()).toBe(3);
    expect(identifiers.at<Identifier>(2).getNode().name).toBe('baz');
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
    const method = node.findFirstChildOfType(t.MethodDefinition);
    expect(method.format()).toBe('bar() {}');
    const block = method.findFirstChildOfType(t.BlockStatement);
    expect(block.format()).toBe('{}');
  });

  it('find closest parent', () => {
    const code = 'class Foo { bar() {} }';
    const node = JsNode.fromModuleCode(code);
    const method = node.findFirstChildOfType(t.MethodDefinition);
    expect(method.format()).toBe('bar() {}');
    const program = method.findClosestParentOfType(t.Program);
    expect(program.format()).toBe(code);
  });

  it('find closest scope', () => {
    const code = 'function foo() { const foo = 42; }';
    const node = JsNode.fromModuleCode(code)
      .findFirstChildOfType(t.VariableDeclaration)
      .findClosestScope();
    expect(node.getType()).toBe(t.FunctionDeclaration.toString());
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
    const node = JsNode.fromModuleCode(code).findFirstChildOfType(t.Literal);
    expect(node.ascend().format()).toBe('foo = 42');
    expect(node.ascend(node => node.check(t.Program)).format()).toBe(code);
  });

  it('get root', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    const literal = node.findFirstChildOfType(t.Literal);
    expect(literal.format()).toBe('42');
    expect(literal.getRoot().format()).toBe(code);
  });

  it('replace', () => {
    const code = 'const foo = 42;';
    const node = JsNode.fromModuleCode(code);
    node
      .findFirstChildOfType(t.Literal)
      .replace(Builders['literal'](23));
    expect(node.format()).toBe(code.replace('42', '23'));
  });
});
