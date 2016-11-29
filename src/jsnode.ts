/// <reference path="../typings/jscodeshift.d.ts" />

import * as ast from 'ast-types';
import * as js from 'jscodeshift';

type TypeIdentifier = (ast.Node | ast.Type | string);

const t = ast.namedTypes;

const isCollection = (node: any) => node.constructor.name === 'Collection';
const isPath = (node: any) => node instanceof ast.Path;
const isNode = (node: any) => !!node.type;

/**
 * Represents a collection of nodes. These nodes can be anywhere in the AST.
 */
export class JsNodeCollection {
    _paths: Array<ast.Path>;

    constructor(obj: any) {
        if (obj instanceof Array) {
            this._paths = js(obj).paths();
        } else if (isCollection(obj)) {
            this._paths = obj.paths();
        }
    }

    /**
     * Returns the number of nodes in the collection.
     */
    size(): number {
        return this._paths.length;
    }

    /**
     * If the node represents a collection of nodes, this method will pick the
     * node at a specified index.
     */
    at(index: number): JsNode {
        if (index >= this._paths.length) {
            throw new Error('Index out of bounds');
        }
        return new JsNode(this._paths[index]);
    }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode {
    _node: ast.Node;
    _path: ast.Path;

    static fromModuleCode(code: string): JsNode {
        return new JsNode(code);
    }

    static fromCode(code: string): JsNodeCollection {
        let program = <ast.Program>new JsNode(code).findFirstChildOfType(t.Program).getNode();
        return new JsNodeCollection(program.body);
    }

    // constructor(obj: (string | ast.Path | js.Collection)) {
    constructor(obj: any, args?: Object) {
        if (typeof(obj) === 'string') {
            obj = js(obj, args);
        }
        if (isCollection(obj)) {
            this._node = obj.nodes()[0];
            this._path = obj.get();
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
        return this._path;
    }

    /**
     * Returns a node object for the current AST root.
     *
     * For more information about Paths, see:
     * https://github.com/benjamn/ast-types
     */
    getNode(): ast.Node {
        return this._node;
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

    /**
     * Returns true if the node type matches the specified type.
     */
    check(type: any) {
        return this.getType() === type.toString();
    }

    findFirstChildOfType(type: TypeIdentifier, attr?: {}): JsNode {
        let collection = js(this._path).find(type, attr);
        return new JsNode(collection.get());
    }

    findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNodeCollection {
        let collection = js(this._path).find(type, attr);
        return new JsNodeCollection(collection);
    }

    findClosestParentOfType(type: TypeIdentifier, attr?: {}): JsNode {
        return new JsNode(js(this._path).closest(type, attr));
    }

    findClosestScope(): JsNode {
        return new JsNode(js(this._path).closestScope());
    }
}
