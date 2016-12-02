/// <reference path="../typings/jscodeshift.d.ts" />

import { Node, Path, Type, Program, namedTypes as t, builders, visit } from 'ast-types';
import { Collection } from 'jscodeshift-collection';
import js = require('jscodeshift');

export type TypeIdentifier = (Node | Type | string);
export type GenericJsNode = JsNode<Node>;
export const NamedTypes = t;
export const Builders = builders;

const isCollection = (obj: any): obj is Collection => obj.constructor.name === 'Collection';
const isPath = (obj: any): obj is Path => obj instanceof Path;
// const isNode = (obj: any): obj is Node => !!obj.type;

/**
 * Represents a collection of nodes. These nodes can be anywhere in the AST.
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
  at<T extends Node>(index: number): JsNode<T> {
    if (index >= this._paths.length) {
      throw new Error('Index out of bounds');
    }
    return <JsNode<T>>JsNode.fromPath(this._paths[index]);
  }

  map<T extends Node>(func: (node: JsNode<T>, index?: number) => any): any[] {
    return this._paths.map((value, index, array) => func(<JsNode<T>>JsNode.fromPath(value), index));
  }

  forEach<T extends Node>(func: (node: JsNode<T>, index?: number) => any): void {
    this._paths.forEach((value, index, array) => func(<JsNode<T>>JsNode.fromPath(value), index));
  }

  /**
   * Returns true if the predicate evaluates to true for any node in the
   * collection.
   */
  has<T extends Node>(func: (node: JsNode<T>, index?: number) => any): boolean {
    let i = 0;
    for (let path of this._paths) {
      if (func(<JsNode<T>>JsNode.fromPath(path), i)) {
        return true;
      }
      i++;
    }
    return false;
  }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode<NodeType extends Node> implements transformabit.JsNode {
  _node: NodeType;
  _path: Path;

  static fromModuleCode(code: string, args?: Object): GenericJsNode {
    return JsNode.fromCollection(js(code, args));
  }

  static fromCode(code: string, args?: Object): JsNodeCollection {
    const program = <Program>JsNode
      .fromCollection(js(code, args))
      .findFirstChildOfType(t.Program)
      .getNode();
    return new JsNodeCollection(program.body);
  }

  static fromCollection(collection: Collection): GenericJsNode {
    return new JsNode(null, collection.get());
  }

  static fromPath(path: Path): GenericJsNode {
    return new JsNode(null, path);
  }

  static fromNode(astNode: Node): GenericJsNode {
    return new JsNode(astNode);
  }

  constructor(node?: NodeType, path?: Path) {
    this._node = node || (path ? <NodeType>path.value : null);
    this._path = path;
  }

  hasParent(): boolean {
    return !!this._path && !!this._path.parentPath;
  }

  /**
   * Returns the source code for the AST.
   */
  format(): string {
    return js(this._node).toSource().replace(/\r/g, '');
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
  getNode(): NodeType {
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
    const collection = js(this._node).find(type, attr);
    return JsNode.fromPath(collection.get());
  }

  findChildrenOfType(type: TypeIdentifier, attr?: {}): JsNodeCollection {
    const collection = js(this._node).find(type, attr);
    return new JsNodeCollection(collection);
  }

  findClosestParentOfType(type: TypeIdentifier, attr?: {}): GenericJsNode {
    console.assert(this._path);
    const closest = js(this._path).closest(type, attr);
    if (closest.size() > 0) {
      return JsNode.fromCollection(closest);
    }
  }

  findClosestScope(): GenericJsNode {
    console.assert(this._path);
    const closest = js(this._path).closestScope();
    if (closest.size() > 0) {
      return JsNode.fromCollection(closest);
    }
  }

  /**
   * Descends the AST and returns the next node that satisfies the
   * acceptCallback callback.
   */
  descend(acceptCallback?: (node: GenericJsNode) => boolean): GenericJsNode {
    let skip = true;
    let result: Path;
    visit(this._node, {
      visitNode: function (p: Path) {
        if (skip) {
          // This skips the node itself (just traverses children)
          skip = false;
          this.traverse(p);
        } else {
          const node = JsNode.fromPath(p);
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
   * Returns the node at the root of the current AST.
   */
  getRoot() {
    let path = this._path;
    while (path.parentPath) {
      path = path.parentPath;
    }
    return JsNode.fromPath(path);
  }

  /**
   * Replaces the current node with another.
   *
   * Side-effects are immediately applied to the current AST and all other
   * ASTs that reference this AST.
   */
  replace(node: (transformabit.JsNode | Node)): JsNode<NodeType> {
    console.assert(this._path);
    if (node instanceof JsNode) {
      this._path.replace(node._node);
      this._node = <NodeType>node._node;
    } else {
      this._path.replace(<NodeType>node);
      this._node = <NodeType>node;
    }
    return this;
  }

  /**
   * Removes the sub-tree from the AST that has this node at the root.
   */
  remove(): void {
    console.assert(this._path);
    js(this._path).remove();
  }
}
