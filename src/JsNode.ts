/// <reference path="../typings/jscodeshift.d.ts" />

import {
  Node,
  NodePath,
  Type,
  namedTypes as t
} from 'ast-types';
import { Collection } from 'jscodeshift-collection';
import * as js from 'jscodeshift';

// Important! Even though recast just re-exports types from ast-types, JS will
// consider them to be different objects. When jscodeshift gets a NodePath that
// was created in ast-types instead of recast, it won't recognise it and fail.
const visit = require('recast').visit;

export type TypeIdentifier = (Node | Type | string);
export type GenericJsNode = JsNode<Node, any>;
export type JsNodeType<T extends GenericJsNode> = {
  new(): T,
  check?: (node: GenericJsNode) => boolean
};

export class InvalidTypeError extends Error {
  constructor(public typeId: string) {
    super(`Invalid type "${typeId}"; only annotated types are allowed`);
  }
}

export class JsNodeFactory {
  static registeredTypes: {[typeName: string]: JsNodeType<any>} = {};

  static registerType(type: JsNodeType<any>): void {
    JsNodeFactory.registeredTypes[type.name] = type;
  }

  static getType<T extends GenericJsNode>(typeName: string): JsNodeType<T> {
    return JsNodeFactory.registeredTypes[typeName];
  }

  static create<T extends GenericJsNode>(typeName: string): T {
    const type = JsNodeFactory.getType<T>(typeName);
    if (!type) {
      // console.warn('Attempted to create unknown node type: ' + typeName);
      return <T>new JsNode<any, any>();
    }
    return new type();
  }
}

/**
 * Represents a collection of nodes. These nodes can be anywhere in the AST.
 */
export class JsNodeList<T extends GenericJsNode> {
  protected _paths: NodePath[] = [];

  static fromNodes(nodes: Node[]): JsNodeList<any> {
    const list = new JsNodeList();
    list._paths = js(nodes).paths();
    return list;
  }

  static fromPaths(paths: NodePath[]): JsNodeList<any> {
    const list = new JsNodeList();
    list._paths = paths;
    return list;
  }

  static fromCollection(collection: Collection): JsNodeList<any> {
    const list = new JsNodeList();
    list._paths = collection.paths();
    return list;
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
  at(index: number): T {
    if (index >= this._paths.length) {
      throw new Error('Index out of bounds');
    }
    return <T>JsNode.fromPath(this._paths[index]);
  }

  map(func: (node: T, index?: number) => any): any[] {
    return this._paths.map((value, index, array) =>
      func(<T>JsNode.fromPath(value), index));
  }

  filter(predicate: (node: T, index?: number) => boolean): JsNodeList<T> {
    return JsNodeList.fromPaths(this._paths.filter((value, index, array) =>
      predicate(<T>JsNode.fromPath(value), index)));
  }

  forEach(func: (node: T, index?: number) => any): void {
    this._paths.forEach((value, index, array) =>
      func(<T>JsNode.fromPath(value), index));
  }

  /**
   * Returns true if the predicate evaluates to true for any node in the
   * collection.
   */
  has(func: (node: T, index?: number) => any): boolean {
    for (let i = 0; i < this._paths.length; i++) {
      if (func(<T>JsNode.fromPath(this._paths[i]), i)) {
        return true;
      }
    }
    return false;
  }

  push(node: T): JsNodeList<T> {
    this._paths.push(node.path);
    return this;
  }

  pushPath(path: NodePath): JsNodeList<T> {
    this._paths.push(path);
    return this;
  }

  removeAll(): JsNodeList<T> {
    this._paths.forEach(path => path.prune());
    return this;
  }

  // TODO: find a way to properly type this array or remove the method
  // toArray(): GenericJsNode[] {
  //   return this._paths.map(path => JsNode.fromPath(path));
  // }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode<T extends Node, P> implements transformabit.JsNode {
  protected _node: T;
  protected _path: NodePath;

  public props: P;

  static fromNode<T extends GenericJsNode>(astNode: Node): T {
    let node = JsNodeFactory.create<T>(astNode.type.toString());
    node.node = astNode;
    return node;
  }

  static fromPath<T extends GenericJsNode>(path: NodePath): T {
    const node = JsNodeFactory.create<T>(path.value.type.toString());
    node.path = path;
    return node;
  }

  static fromModuleCode(code: string, args?: Object): GenericJsNode {
    return JsNode.fromCollection(js(code, args));
  }

  static fromCode<T extends GenericJsNode>(code: string, args?: Object): JsNodeList<T> {

    const program = JsNode.fromCollection(js(code, args).find('Program'));
    return JsNodeList.fromNodes((<any>program.node).body);
  }

  static fromCollection(collection: Collection): GenericJsNode {
    return JsNode.fromPath(collection.get());
  }

  static fromExpressionStatement(code: string, args?: Object): GenericJsNode {
    return JsNode
      .fromCollection(js(`() => ${code}`, args).find('ArrowFunctionExpression'))
      .descend();
  }

  static fromFunctionBody<T extends GenericJsNode>(code: string, args?: Object): JsNodeList<T> {
    return JsNode
      .fromCollection(js(`() => {${code}}`, args).find('BlockStatement'))
      .children<T>();
  }

  constructor(props?: P, children?: GenericJsNode[]) {
    if (props || children) {
      this.build(props, children);
    }
  }

  hasParent(): boolean {
    return !!this._path && !!this._path.parentPath;
  }

  /**
   * Returns the source code for the

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
  get path(): NodePath {
    return this._path;
  }

  set path(path: NodePath) {
    this._node = <T>path.value;
    this._path = path;
  }

  /**
   * Returns a node object for the current AST root.
   *
   * For more information about Paths, see:
   * https://github.com/benjamn/ast-types
   */
  get node(): T {
    return this._node;
  }

  set node(node: T) {
    this._node = node;
  }

  build(props: P, children?: any[]): JsNode<T, P> {
    this.props = props;
    if (!this.node || !this.node.type) {
      throw new Error(`${this.constructor.name}.build() did not assign a valid node`);
    }
    // console.warn(this.constructor.name, this.node);
    return this;
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
  check<T extends GenericJsNode>(type: JsNodeType<T>): this is T {
    if (type.check) {
      // If the type has a static check(), use that one instead. This allows
      // complex types to perform more sophisticated checks.
      return type.check(this);
    }
    return this.type() === type.name;
  }

  findFirstChildOfType<T extends GenericJsNode>(type: JsNodeType<T>, attr?: {}): T {
    const matchedNode = <T>this.descend(node => node.check(type));
    // We can't just return matchedNode since it will always be a registered
    // type. In case we are looking for a complex type, we need to explicitly
    // construct it from the matched node.
    const node = new type();
    node.path = matchedNode.path;
    return node;
  }

  findClosestParentOfType<T extends GenericJsNode>(type: JsNodeType<T>, attr?: {}): T {
    const matchedNode = <T>this.ascend(node => node.check(type));
    if (this._path) {
      // We can't just return matchedNode since it will always be a registered
      // type. In case we are looking for a complex type, we need to explicitly
      // construct it from the matched node.
      const node = new type();
      node.path = matchedNode.path;
      return node;
    }
  }

  findClosestScope(): GenericJsNode {
    if (this._path) {
      const scope = this._path.scope && this._path.scope.path;
      if (scope) {
        return JsNode.fromPath(scope);
      }
    }
  }

  /**
   * Descends the AST and returns the next node that satisfies the
   * predicate callback.
   */
  descend(predicate?: (node: GenericJsNode) => boolean): GenericJsNode {
    let result: NodePath;
    const self = this._node;
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (p.node === self) {
          this.traverse(p)
        } else if (!result) {
          const node = JsNode.fromPath(p);
          if (predicate === undefined || predicate(node)) {
            result = p;
            return false;
          }
          this.traverse(p);
        }
        return false;
      }
    });
    if (result) {
      return JsNode.fromPath(result);
    }
  }

  /**
   * Descends the AST and returns all nodes that satisfies the predicate.
   */
  find<T extends GenericJsNode>(predicate: (node: T) => boolean): JsNodeList<T> {
    let result = new JsNodeList<T>();
    const self = this._node;
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (p.node === self) {
          this.traverse(p)
        } else {
          const node = JsNode.fromPath(p);
          if (predicate === undefined || predicate(<T>node)) {
            result.push(<T>node);
          }
          this.traverse(p);
        }
      }
    });
    return result;
  }

  /**
   * Descends the AST and returns all nodes that satisfies the predicate.
   */
  findChildrenOfType<T extends GenericJsNode>(
    type: JsNodeType<T>, predicate?: (node: T) => boolean): JsNodeList<T> {

    let result = new JsNodeList<T>();
    const self = this._node;
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (p.node === self) {
          this.traverse(p)
        } else {
          const node = JsNode.fromPath(p);
          if (node.check(type) && (!predicate || predicate(node))) {
            result.push(node);
          }
          this.traverse(p);
        }
      }
    });
    return result;
  }

  /**
   * Ascends the AST and returns the first parent node that satisfies the
   * predicate callback.
   */
  ascend(predicate?: (node: GenericJsNode) => boolean): GenericJsNode {
    if (this._path) {
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
  }

  /**
   * Returns the node at the root of the current AST.
   */
  getRoot() {
    if (this._path) {
      let path = this._path;
      while (path.parent) {
        path = path.parent;
      }
      return JsNode.fromPath(path);
    }
  }

  /**
   * Replaces the current node with another.
   */
  replace(node: (transformabit.JsNode | Node)): JsNode<T, P> {
    if (node instanceof JsNode) {
      if (this._path) {
        this._path.replace(node._node);
      }
      this._node = <T>node._node;
    } else {
      if (this._path) {
        this._path.replace(<T>node);
      }
      this._node = <T>node;
    }
    return this;
  }

  /**
   * Removes the sub-tree from the AST that has this node at the root.
   */
  remove(): void {
    if (this._path) {
      this._path.prune();
    }
  }

  /**
   * Returns child nodes.
   */
  children<T extends GenericJsNode>(): JsNodeList<T> {
    const self = this._node;
    let children = new JsNodeList<T>();
    visit(this._node, {
      visitNode: function(p: NodePath) {
        if (p.parent && p.parent.node === self) {
          children.push(JsNode.fromPath<T>(p));
        }
        this.traverse(p);
      }
    });
    return children;
  }

  /**
   * Removes child nodes.
   */
  removeChildren(predicate?: (node: GenericJsNode) => boolean): void {
    const self = this._node;
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

  /**
   * Gets the node that wraps a property of the current node.
   */
  protected getNode<T extends GenericJsNode>(propertyName: string): T {
    if (this._path) {
      return JsNode.fromPath<T>(this._path.get(propertyName));
    } else {
      return JsNode.fromNode<T>((<any>this._node)[propertyName]);
    }
  }

  /**
   * Get a list of nodes that wrap a property of the current node.
   */
  protected getNodes<T extends GenericJsNode>(propertyName: string): JsNodeList<T> {
    if (this._path) {
      return JsNodeList.fromPaths(this._path.get(propertyName));
    } else {
      return JsNodeList.fromNodes((<any>this._node)[propertyName]);
    }
  }
}
