/// <reference path="../typings/jscodeshift.d.ts" />

import { Node, Path, Type, Program, namedTypes as t } from 'ast-types';
import { Collection } from 'jscodeshift-collection';

import ast = require('ast-types');
import js = require('jscodeshift');

export type TypeIdentifier = (Node | Type | string);
export type GenericJsNode = JsNode<Node>;

const isCollection = (obj: any): obj is Collection => obj.constructor.name === 'Collection';
const isPath = (obj: any): obj is Path => obj instanceof Path;
// const isNode = (obj: any): obj is Node => !!obj.type;

/**
 * Represents a collection of nodes. These nodes can be anywhere in the
 */
export class JsNodeCollection {
    _paths: Path[];

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
    at(index: number): GenericJsNode {
        if (index >= this._paths.length) {
            throw new Error('Index out of bounds');
        }
        return JsNode.fromPath(this._paths[index]);
    }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode<NodeType extends Node> {
    _node: NodeType;
    _path: Path;

    static fromModuleCode(code: string, args?: Object): GenericJsNode {
        return JsNode.fromCollection(js(code, args));
    }

    static fromCode(code: string, args?: Object): JsNodeCollection {
        let program = <Program>JsNode
            .fromCollection(js(code, args))
            .findFirstChildOfType(t.Program)
            .getNode();
        return new JsNodeCollection(program.body);
    }

    static fromCollection(collection: Collection): GenericJsNode {
        let node = new JsNode();
        node._node = collection.nodes()[0];
        node._path = collection.get();
        return node;
    }

    static fromPath(path: Path): GenericJsNode {
        let node = new JsNode();
        node._node = path.value;
        node._path = path;
        return node;
    }

    static fromNode(astNode: Node): GenericJsNode {
        let node = new JsNode();
        node._node = astNode;
        node._path = null;
        return node;
    }

    constructor() {

    }

    hasParent(): boolean {
        return !!this._path;
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
        return this._node.type;
    }

    /**
     * Returns true if the node type matches the specified type.
     */
    check(type: TypeIdentifier) {
        return this.getType() === type.toString();
    }

    findFirstChildOfType(type: TypeIdentifier, attr?: {}): GenericJsNode {
        let collection = js(this._node).find(type, attr);
        return JsNode.fromPath(collection.get());
    }

    findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNodeCollection {
        let collection = js(this._node).find(type, attr);
        return new JsNodeCollection(collection);
    }

    findClosestParentOfType(type: TypeIdentifier, attr?: {}): GenericJsNode {
        console.assert(this._path);
        return JsNode.fromCollection(js(this._path).closest(type, attr));
    }

    findClosestScope(): GenericJsNode {
        console.assert(this._path);
        return JsNode.fromCollection(js(this._path).closestScope());
    }

    /**
     * Descends the AST and returns the next node that satisfies the
     * acceptCallback callback.
     */
    descend(acceptCallback?: (node: GenericJsNode) => boolean): GenericJsNode {
        let skip = true;
        let result: Path;
        ast.visit(this._node, {
            visitNode: function(p: Path) {
                if (skip) {
                    // This skips the node itself (just traverses children)
                    skip = false;
                    this.traverse(p);
                } else {
                    let node = JsNode.fromPath(p);
                    if (acceptCallback === undefined || acceptCallback(node)) {
                        result = p;
                        return false;
                    } else {
                        this.traverse(p);
                    }
                }
            }
        });
        return JsNode.fromPath(result);
    }

    /**
     * Ascends the AST and returns the first parent node that satisfies the
     * acceptCallback callback.
     */
    ascend(acceptCallback?: (node: GenericJsNode) => boolean): GenericJsNode {
        console.assert(this._path);
        let currentPath = this._path.parentPath;
        if (acceptCallback) {
            while (currentPath && !acceptCallback(JsNode.fromPath(currentPath))) {
                currentPath = currentPath.parentPath;
            }
        }
        if (currentPath) {
            return JsNode.fromPath(currentPath);
        }
    }

    /**
     * Replaces the current node with another.
     *
     * Side-effects are immediately applied to the current AST and all other
     * ASTs that reference this AST.
     */
    replace(node: (GenericJsNode | Node)): GenericJsNode {
        console.assert(this._path);
        if (node instanceof JsNode) {
            this._path.replace(node._node);
        } else {
            this._path.replace(node);
        }
        return this;
    }
}
