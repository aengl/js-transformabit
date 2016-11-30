/// <reference path="../typings/jscodeshift.d.ts" />

import { Node, Path, Type, Program, namedTypes as t } from 'ast-types';
import { Collection } from 'jscodeshift-collection';

import ast = require('ast-types');
import js = require('jscodeshift');

type TypeIdentifier = (Node | Type | string);

const isCollection = (obj: any): obj is Collection => obj.constructor.name === 'Collection';
const isPath = (obj: any): obj is Path => obj instanceof Path;
// const isNode = (obj: any): obj is Node => !!obj.type;

/**
 * Represents a collection of nodes. These nodes can be anywhere in the
 */
export class JsNodeCollection {
    _paths: Array<Path>;

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
    _node: Node;
    _path: Path;

    static fromModuleCode(code: string, args?: Object): JsNode {
        return new JsNode(code, args);
    }

    static fromCode(code: string, args?: Object): JsNodeCollection {
        let program = <Program>new JsNode(code, args).findFirstChildOfType(t.Program).getNode();
        return new JsNodeCollection(program.body);
    }

    constructor(obj: (string | Collection | Path | Node), args?: Object) {
        if (typeof(obj) === 'string') {
            let collection = js(obj, args);
            this._node = collection.nodes()[0];
            this._path = collection.get();
        } else if (isCollection(obj)) {
            this._node = obj.nodes()[0];
            this._path = obj.get();
        } else if (isPath(obj)) {
            this._node = obj.value;
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
     * Returns the source code for the
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
    getPath(): Path {
        return this._path;
    }

    /**
     * Returns a node object for the current AST root.
     *
     * For more information about Paths, see:
     * https://github.com/benjamn/ast-types
     */
    getNode(): Node {
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
    check(type: TypeIdentifier) {
        return this.getType() === type.toString();
    }

    findFirstChildOfType(type: TypeIdentifier, attr?: {}): JsNode {
        let collection = js(this._node).find(type, attr);
        return new JsNode(collection.get());
    }

    findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNodeCollection {
        let collection = js(this._node).find(type, attr);
        return new JsNodeCollection(collection);
    }

    findClosestParentOfType(type: TypeIdentifier, attr?: {}): JsNode {
        console.assert(this._path);
        return new JsNode(js(this._path).closest(type, attr));
    }

    findClosestScope(): JsNode {
        console.assert(this._path);
        return new JsNode(js(this._path).closestScope());
    }

    /**
     * Descends the AST and returns the next node that satisfies the
     * acceptCallback callback.
     */
    descend(acceptCallback?: (node: JsNode) => boolean): JsNode {
        let skip = true;
        let result: Path;
        ast.visit(this._node, {
            visitNode: function(p: Path) {
                if (skip) {
                    // This skips the node itself (just traverses children)
                    skip = false;
                    this.traverse(p);
                } else {
                    let node = new JsNode(p);
                    if (acceptCallback === undefined || acceptCallback(node)) {
                        result = p;
                        return false;
                    } else {
                        this.traverse(p);
                    }
                }
            }
        });
        return new JsNode(result);
    }

    /**
     * Ascends the AST and returns the first parent node that satisfies the
     * acceptCallback callback.
     */
    ascend(acceptCallback?: (node: JsNode) => boolean): JsNode {
        console.assert(this._path);
        let currentPath = this._path.parentPath;
        if (acceptCallback) {
            while (currentPath && !acceptCallback(new JsNode(currentPath))) {
                currentPath = currentPath.parentPath;
            }
        }
        if (currentPath) {
            return new JsNode(currentPath);
        }
    }
}
