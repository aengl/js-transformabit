/// <reference path="../typings/jscodeshift.d.ts" />

import * as ast from 'ast-types';
import * as js from 'jscodeshift';

type TypeIdentifier = (ast.Node | ast.Type | string);

const t = ast.namedTypes;

const isCollection = (node: any) => node.constructor.name === 'Collection';
const isPath = (node: any) => node instanceof ast.Path;
const isNode = (node: any) => !!node.type;

/**
 * Represents a node in the AST tree.
 *
 * Note that some nodes can be a collection (e.g. a program, or the body of a
 * class).
 */
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

    /**
     * Returns the number of nodes at the root of the AST, or 1 if the root
     * is not a collection of nodes.
     */
    size(): number {
        if (this._path instanceof Array) {
            return this._path.length;
        } else {
            return 1;
        }
    }

    /**
     * If the node represents a collection of nodes, this method will pick the
     * node at a specified index.
     */
    at(index: number): JsNode {
        let path = this.pathAt(index);
        if (!path) {
            throw new Error('The current node does not represent a collection');
        }
        return new JsNode(path);
    }

    /**
     * Returns the source code for the AST.
     */
    format(): string {
        return js(this._node).toSource();
    }

    /**
     * Returns a path object for the current AST root.
     *
     * For more information about Paths, see:
     * https://github.com/benjamn/ast-types
     */
    getPath(): ast.Path {
        return js(this._path).get();
    }

    /**
     * Returns a node object for the current AST root.
     *
     * For more information about Paths, see:
     * https://github.com/benjamn/ast-types
     */
    getNode(): ast.Node {
        return this.getPath().value;
    }

    /**
     * Returns the type string for the current AST root, as specified by the
     * Mozilla Parser API:
     *
     * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
     */
    getType(): string {
        return this.getPath().value.type;
    }

    findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNode {
        return new JsNode(js(this._path).find(type, attr));
    }

    findClosestParentOfType(type: TypeIdentifier, attr?: {}): JsNode {
        return new JsNode(js(this._path).closest(type, attr));
    }

    findClosestScope(): JsNode {
        return new JsNode(js(this._path).closestScope());
    }

    isFile(): boolean {
        return t.File.check(this._node);
    }

    private pathAt(index: number): ast.Path {
        if (this._path instanceof Array) {
            if (index >= this._path.length) {
                throw new Error('Index out of bounds');
            }
            return this._path[index];
        }
    }
}
