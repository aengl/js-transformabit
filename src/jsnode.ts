/// <reference path="../typings/jscodeshift.d.ts" />

import * as ast from 'ast-types';
import * as js from 'jscodeshift';

type TypeIdentifier = (ast.Node | ast.Type | string);

const t = ast.namedTypes;

const isCollection = (node: any) => node.constructor.name === 'Collection';
const isPath = (node: any) => node instanceof ast.Path;
const isNode = (node: any) => !!node.type;

export default class JsNode {
    _node: ast.Node | Array<ast.Node>;
    _path: ast.Path | Array<ast.Path>;

    // constructor(obj: (string | ast.Path | js.Collection)) {
    constructor(obj: any, args?: Object) {
        if (typeof(obj) === 'string') {
            obj = js(obj, args);
        }
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

    size(): number {
        if (this._path instanceof Array) {
            return this._path.length;
        } else {
            return 1;
        }
    }

    at(index: number): JsNode {
        return new JsNode(this.pathAt(index));
    }

    nodeAt(index: number): ast.Node {
        if (this._node instanceof Array) {
            return this._node[index];
        }
    }

    pathAt(index: number): ast.Path {
        if (this._path instanceof Array) {
            return this._path[index];
        }
    }

    print(): string {
        return js(this._node).toSource();
    }

    getPath(): ast.Path {
        return js(this._path).get();
    }

    getNode(): ast.Node {
        return this.getPath().value;
    }

    getType(): string {
        return this.getPath().value.type;
    }

    findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNode {
        return new JsNode(js(this._path).find(type, attr));
    }

    findClosestParentOfType(type: TypeIdentifier, attr?: {}): JsNode {
        return new JsNode(js(this._path).closest(type, attr));
    }

    isFile(): boolean {
        return t.File.check(this._node);
    }
}
