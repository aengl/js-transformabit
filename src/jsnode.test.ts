import * as ast from 'ast-types';
import { JsNode } from './jsnode';

const t = ast.namedTypes;

describe('node', () => {
    it('create & print', () => {
        let code = 'const foo = 42;';
        expect(new JsNode(code).format()).toBe(code);
    });

    it('create from module', () => {
        let code = 'const foo = 42;';
        let node = JsNode.fromModuleCode(code);
        expect(node.check(t.File)).toBe(true);
    });

    it('create from code', () => {
        let code = 'const foo = 42;';
        let node = JsNode.fromCode(code).at(0);
        expect(node.check(t.VariableDeclaration)).toBe(true);
    });

    it('find child', () => {
        let code = 'let foo, bar = 42;';
        let node = new JsNode(code);
        let identifiers = node.findChildrenOfType(t.Identifier);
        expect(identifiers.size()).toBe(2);
        expect(identifiers.at(0).format()).toBe('foo');
        expect(identifiers.at(1).format()).toBe('bar');
    });

    it('find closest parent', () => {
        let code = 'let foo = 42;';
        let node = new JsNode(code);
        let identifier = node.findFirstChildOfType(t.Identifier);
        expect(identifier.format()).toBe('foo');
        let declaration = identifier.findClosestParentOfType(t.Declaration);
        expect(declaration.format()).toBe(code);
    });

    it('find closest scope', () => {
        let code = 'function foo() { let foo = 42; }';
        let node = new JsNode(code)
            .findFirstChildOfType(t.VariableDeclaration)
            .findClosestScope();
        expect(node.getType()).toBe(t.FunctionDeclaration.toString());
        expect(node.format()).toBe(code);
    });

    it('descend', () => {
        let code = 'let foo = 42;';
        let node = JsNode.fromCode(code).at(0).descend();
        expect(node.format()).toBe('foo = 42');
        node = new JsNode(code).descend(node => node.check(t.Literal));
        expect(node.format()).toBe('42');
    });

    it('ascend', () => {
        let code = 'let foo = 42;';
        let node = new JsNode(code).findFirstChildOfType(t.Literal);
        expect(node.ascend().format()).toBe('foo = 42');
        expect(node.ascend(node => node.check(t.Program)).format()).toBe(code);
    });
});
