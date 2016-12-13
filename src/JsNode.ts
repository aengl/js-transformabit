/// <reference path="../typings/jscodeshift.d.ts" />

import {
  Node,
  NodePath,
  Type,
  Program,
  namedTypes as t,
  visit
} from 'ast-types';
import { Collection } from 'jscodeshift-collection';
import * as js from 'jscodeshift';

export type TypeIdentifier = (Node | Type | string);
export type GenericJsNode = JsNode<Node, any>;
export type JsNodeType<T> = { new(): T };

const isCollection = (obj: any): obj is Collection =>
  obj.constructor.name === 'Collection';
// const isPath = (obj: any): obj is NodePath => obj instanceof NodePath;
// const isNode = (obj: any): obj is Node => !!obj.type;

export class JsNodeFactory {
  static registeredTypes: {[typeName: string]: JsNodeType<any>} = {};

  static registerType(type: JsNodeType<any>): void {
    JsNodeFactory.registeredTypes[type.name] = type;
  }

  static create<T extends GenericJsNode>(typeName: string): T {
    const type = JsNodeFactory.registeredTypes[typeName];
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
  private _paths: NodePath[];

  constructor(obj?: any) {
    if (!obj) {
      this._paths = [];
    } else if (obj instanceof Array) {
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
    return new JsNodeList<T>(this._paths.filter((value, index, array) =>
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

  toArray(): T[] {
    return this._paths.map(path => JsNode.fromPath(path) as T);
  }
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

  static fromCode(code: string, args?: Object): JsNodeList<any> {
    const program = <Program>JsNode.fromCollection(js(code, args).find('Program')).node;
    return new JsNodeList(program.body);
  }

  static fromCollection(collection: Collection): GenericJsNode {
    return JsNode.fromPath(collection.get());
  }

  static fromExpressionStatement(code: string, args?: Object): GenericJsNode {
    return JsNode
      .fromCollection(js(`() => ${code}`, args).find('ArrowFunctionExpression'))
      .descend();
  }

  static fromFunctionBody(code: string, args?: Object): JsNodeList<any> {
    return JsNode
      .fromCollection(js(`() => {${code}}`, args).find('BlockStatement'))
      .children();
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
    return this.type() === type.name;
  }

  findFirstChildOfType<T extends GenericJsNode>(type: JsNodeType<T>, attr?: {}): T {
    let astType = t[type.name];
    console.assert(astType);
    const collection = js(this._node).find(type.name, attr);
    return <T>JsNode.fromCollection(collection);
  }

  findChildrenOfType<T extends GenericJsNode>(type: JsNodeType<T>, attr?: {}): JsNodeList<T> {
    let astType = t[type.name];
    console.assert(astType);
    const collection = js(this._node).find(astType, attr);
    return new JsNodeList<T>(collection);
  }

  findClosestParentOfType<T extends GenericJsNode>(type: JsNodeType<T>, attr?: {}): T {
    console.assert(this._path);
    let astType = t[type.name];
    console.assert(astType);
    const closest = js(this._path).closest(astType, attr);
    if (closest.size() > 0) {
      return <T>JsNode.fromCollection(closest);
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
  replace(node: (transformabit.JsNode | Node)): JsNode<T, P> {
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
   * Returns child nodes.
   */
  children<T extends GenericJsNode>(): JsNodeList<T> {
    const self = this._path.node;
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
    const self = this._path.node;
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
   * Finds a node of a specific type amongst the JsCode children.
   */
  protected _find(children: GenericJsNode[], type: JsNodeType<any>): GenericJsNode {
    for (let child of children) {
      if (child instanceof type) {
        return child;
      }
    }
    return null;
  }
}
