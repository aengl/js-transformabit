import { Parser } from './parser';
import * as ast from 'ast-types';

const t = ast.namedTypes;

describe('node', () => {
    it('find child', () => {
        let code = 'let foo, bar = 42;';
        let node = Parser.parse(code);
        let identifiers = node.findChildrenOfType(t.Identifier);
        expect(identifiers.size()).toBe(2);
        expect(identifiers.at(0).print()).toBe('foo');
        expect(identifiers.at(1).print()).toBe('bar');

    });

    it('find closest parent', () => {
        let code = 'let foo = 42;';
        let node = Parser.parse(code);
        let identifier = node.findChildrenOfType(t.Identifier);
        expect(identifier.print()).toBe('foo');
        let declaration = identifier.findClosestParentOfType(t.Declaration);
        expect(declaration.print()).toBe(code);
    });
});

describe('parser', () => {
    it('parse & print', () => {
        let code = 'const foo = 42;';
        let node = Parser.parse(code);
        expect(node.getType()).toBe('File');
        expect(node.isFile()).toBe(true);
        expect(node.print()).toBe(code);
    });
});
