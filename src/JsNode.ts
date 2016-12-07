/// <reference path="../typings/jscodeshift.d.ts" />

import { Node, NodePath, Type, Program, namedTypes as t, builders, visit } from 'ast-types';
import { Collection } from 'jscodeshift-collection';
import js = require('jscodeshift');

export type TypeIdentifier = (Node | Type | string);
export type GenericJsNodeList = JsNodeList<any>;
export type GenericJsNode = JsNode<Node>;
export const NamedTypes = t;
export const Builders = builders;

const isCollection = (obj: any): obj is Collection => obj.constructor.name === 'Collection';
const isPath = (obj: any): obj is NodePath => obj instanceof NodePath;
// const isNode = (obj: any): obj is Node => !!obj.type;

/**
 * Represents a collection of nodes. These nodes can be anywhere in the AST.
 */
export class JsNodeList<T extends Node> {
  _paths: NodePath[];

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

  map(func: (node: JsNode<T>, index?: number) => any): any[] {
    return this._paths.map((value, index, array) => func(<JsNode<T>>JsNode.fromPath(value), index));
  }

  forEach(func: (node: JsNode<T>, index?: number) => any): void {
    this._paths.forEach((value, index, array) => func(<JsNode<T>>JsNode.fromPath(value), index));
  }

  /**
   * Returns true if the predicate evaluates to true for any node in the
   * collection.
   */
  has(func: (node: JsNode<T>, index?: number) => any): boolean {
    for (let i = 0; i < this._paths.length; i++) {
      if (func(<JsNode<T>>JsNode.fromPath(this._paths[i]), i)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode<T extends Node> implements transformabit.JsNode {
  _node: T;
  _path: NodePath;

  static fromModuleCode(code: string, args?: Object): GenericJsNode {
    return JsNode.fromCollection(js(code, args));
  }

  static fromCode(code: string, args?: Object): GenericJsNodeList {
    const program = <Program>JsNode
      .fromCollection(js(code, args))
      .findFirstChildOfType(t.Program)
      .node();
    return new JsNodeList(program.body);
  }

  static fromCollection(collection: Collection): GenericJsNode {
    return new JsNode(null, collection.get());
  }

  static fromPath(path: NodePath): GenericJsNode {
    return new JsNode(null, path);
  }

  static fromNode(astNode: Node): GenericJsNode {
    return new JsNode(astNode);
  }

  static fromExpressionStatement(code: string, args?: Object): GenericJsNode {
    return JsNode
      .fromCollection(js(`() => ${code}`, args))
      .findFirstChildOfType(t.ArrowFunctionExpression)
      .descend();
  }

  constructor(node?: T, path?: NodePath) {
    this._node = node || (path ? <T>path.value : null);
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
  path(): NodePath {
    return this._path;
  }

  /**
   * Returns a node object for the current AST root.
   *
   * For more information about Paths, see:
   * https://github.com/benjamn/ast-types
   */
  node(): T {
    return this._node;
  }

  /**
   * Returns the type string for the current AST root, as specified by the
   * Mozilla Parser API:
   *
   * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
   */
  type(): string {
    return this._node.type;
  }

  /**
   * Returns true if the node type matches the specified type.
   */
  check<T extends Node>(type: TypeIdentifier): this is JsNode<T> {
    return this.type() === type.toString();
  }

  findFirstChildOfType<T extends Node>(type: TypeIdentifier, attr?: {}): JsNode<T> {
    const collection = js(this._node).find(type, attr);
    return <JsNode<T>>JsNode.fromPath(collection.get());
  }

  findChildrenOfType<T extends Node>(type: TypeIdentifier, attr?: {}): JsNodeList<T> {
    const collection = js(this._node).find(type, attr);
    return new JsNodeList(collection);
  }

  findClosestParentOfType<T extends Node>(type: TypeIdentifier, attr?: {}): JsNode<T> {
    console.assert(this._path);
    const closest = js(this._path).closest(type, attr);
    if (closest.size() > 0) {
      return <JsNode<T>>JsNode.fromCollection(closest);
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
   * predicate callback.
   */
  descend(predicate?: (node: GenericJsNode) => boolean): GenericJsNode {
    let skip = true;
    let result: NodePath;
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (skip) {
          // This skips the node itself (just traverses children)
          skip = false;
          this.traverse(p);
        } else {
          const node = JsNode.fromPath(p);
          if (predicate === undefined || predicate(node)) {
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
   * predicate callback.
   */
  ascend(predicate?: (node: GenericJsNode) => boolean): GenericJsNode {
    console.assert(this._path);
    let currentPath = this._path.parent;
    if (predicate) {
      while (currentPath && !predicate(JsNode.fromPath(currentPath))) {
        currentPath = currentPath.parent;
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
    while (path.parent) {
      path = path.parent;
    }
    return JsNode.fromPath(path);
  }

  /**
   * Replaces the current node with another.
   */
  replace(node: (transformabit.JsNode | Node)): JsNode<T> {
    console.assert(this._path);
    if (node instanceof JsNode) {
      this._path.replace(node._node);
      this._node = <T>node._node;
    } else {
      this._path.replace(<T>node);
      this._node = <T>node;
    }
    return this;
  }

  /**
   * Removes the sub-tree from the AST that has this node at the root.
   */
  remove(): void {
    console.assert(this._path);
    this._path.prune();
  }

  /**
   * Removes child nodes.
   */
  removeChildren(predicate?: (node: GenericJsNode) => boolean): void {
    let self = this._path.node;
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (p.parent && p.parent.node === self) {
          const node = JsNode.fromPath(p);
          if (predicate === undefined || predicate(node)) {
            p.prune();
          }
        }
        this.traverse(p);
      }
    });
  }

  /**
   * Removes all child matching descendants.
   */
  removeDescendants(predicate: (node: GenericJsNode) => boolean): void {
    visit(this._node, {
      visitNode: function(p: NodePath) {
        const node = JsNode.fromPath(p);
        if (predicate(node)) {
          p.prune();
        }
        this.traverse(p);
      }
    });
  }
}
