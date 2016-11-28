/// <reference path="../typings/ast-types.d.ts" />

import * as estree from 'estree';
import * as ast from '../typings/ast-types';

const js: any = require('jscodeshift');

const isCollection = (node: any) => node.constructor.name === 'Collection';
const isPath = (node: any) => node instanceof js.types.Path;
const isNode = (node: any) => !!node.type;

export class NodeCollection {
    _collection: any;

    constructor(collection: any) {
        console.assert(isCollection(collection));
        this._collection = collection;
    }
}

export class Node {
    _node: estree.Node;
    _path: any;

    constructor(obj: any) {
        if (isCollection(obj)) {
            this._node = obj.nodes()[0];
            this._path = obj.paths()[0];
        } else if (isPath(obj)) {
            this._node = obj.node;
            this._path = obj;
        } else {
            this._node = obj;
            this._path = undefined;
        }
    }

    get type(): string {
        return this._node.type;
    }

    print(): string {
        return js(this._node).toSource();
    }

    findChildOfType(type: ast.Type, attr?: {}): Node {
        return new Node(js(this._node).find(type, attr));
    }

    isFile(): boolean {
        return js.File.check(this._node);
    }
}

export namespace Parser {
    export function parse(code: string): Node {
        return new Node(js(code));
    }
}
