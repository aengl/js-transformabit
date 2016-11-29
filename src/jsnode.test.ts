import * as ast from 'ast-types';
import { JsNode } from './jsnode';

const t = ast.namedTypes;

describe('node', () => {
    it('parse & print', () => {
        let code = 'const foo = 42;';
        let node = new JsNode(code);
        expect(node.getType()).toBe('File');
        expect(node.isFile()).toBe(true);
        expect(node.format()).toBe(code);
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
});
