import { Parser } from './parser';
import * as ast from '../typings/ast-types';
const j = require('jscodeshift');

describe('node', () => {
    it('find child', () => {
        let code = 'const foo = 42;';
        let node = Parser.parse(code);
        let newNode = node.findChildOfType(<ast.Type>j.Identifier);
        expect(newNode.print()).toBe('foo');
    });
});

describe('parser', () => {
    it('parse & print', () => {
        let code = 'const foo = 42;';
        let node = Parser.parse(code);
        expect(node.type).toBe('File');
        expect(node.isFile()).toBe(true);
        expect(node.print()).toBe(code);
    });
});
