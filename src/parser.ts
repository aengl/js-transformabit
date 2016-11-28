/// <reference path="../typings/ast-types.d.ts" />
/// <reference path="../typings/jscodeshift.d.ts" />

import * as estree from 'estree';
import * as ast from 'ast-types';
import js = require('jscodeshift');

const t = ast.namedTypes;

const isCollection = (node: any) => node.constructor.name === 'Collection';
const isPath = (node: any) => node instanceof ast.Path;
const isNode = (node: any) => !!node.type;

export class AtomistNode {
    _node: estree.Node | Array<estree.Node>;
    _path: ast.Path | Array<ast.Path>;

    constructor(obj: any) {
        if (isCollection(obj)) {
            this._node = obj.nodes();
            this._path = obj.paths();
        } else if (isPath(obj)) {
            this._node = obj.node;
            this._path = obj;
        } else {
            this._node = obj;
            this._path = undefined;
        }
        if (this._node instanceof Array && this._node.length === 1) {
            this._node = this._node[0];
        }
        if (this._path instanceof Array && this._path.length === 1) {
            this._path = this._path[0];
        }
    }

    get type(): string {
        if (this._node instanceof Array) {
            throw new Error('Can\'t query type from a node collection');
        } else {
            return this._node.type;
        }
    }

    print(): string {
        return js(this._node).toSource();
    }

    findChildOfType(type: ast.Type, attr?: {}): AtomistNode {
        return new AtomistNode(js(this._node).find(type, attr));
    }

    isFile(): boolean {
        return t.File.check(this._node);
    }
}

export namespace Parser {
    export function parse(code: string): AtomistNode {
        return new AtomistNode(js(code));
    }
}
