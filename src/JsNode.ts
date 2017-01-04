import { ast, recast } from '../deps/bundle';
import { File } from './JsCode';

// Important! Even though recast just re-exports types from ast-types, JS will
// consider them to be different objects. When jscodeshift gets a ast.NodePath that
// was created in ast-types instead of recast, it won't recognise it and fail.
const visit = recast.visit;

export type TypeIdentifier = (ast.Node | ast.Type | string);
export type GenericJsNode = JsNode<ast.Node, any>;
export type JsNodeType<T extends GenericJsNode> = {
  new (): T;
  check?: (node: GenericJsNode) => boolean;
};

export class InvalidTypeError extends Error {
  constructor(public typeId: string) {
    super(`Invalid type "${typeId}"; only annotated types are allowed`);
  }
}

export class JsNodeFactory {
  static registeredTypes: { [typeName: string]: JsNodeType<any> } = {};

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
  protected _paths: ast.NodePath[] = [];
  protected _type: JsNodeType<T>;
  private _pointer = 0;

  static fromPath<T extends GenericJsNode>(
    path: ast.NodePath, type: JsNodeType<T>): JsNodeList<any> {

    const list = new JsNodeList(type);
    list._paths = path.map(p => p);
    return list;
  }

  static fromPaths<T extends GenericJsNode>(
    paths: ast.NodePath[], type: JsNodeType<T>): JsNodeList<any> {

    const list = new JsNodeList(type);
    list._paths = paths;
    return list;
  }

  // for jscodeshift
  // static fromCollection(collection: Collection): JsNodeList<any> {
  //   const list = new JsNodeList();
  //   list._paths = collection.paths();
  //   return list;
  // }

  constructor(type?: JsNodeType<T>) {
    this._type = type;
  }

  /**
   * Returns the number of nodes in the collection.
   */
  size(): number {
    return this._paths.length;
  }

  /**
   * Returns the first element, or undefined if the collection is empty.
   */
  first(): T {
    if (this.size() > 0) {
      return this.at(0);
    }
  }

  /**
   * Returns the last element, or undefined if the collection is empty.
   */
  last(): T {
    let size = this.size();
    if (size > 0) {
      return this.at(size - 1);
    }
  }

  /**
   * If the node represents a collection of nodes, this method will pick the
   * node at a specified index.
   */
  at(index: number): T {
    return this.getTypedNode(index);
  }

  /**
   * Implements Iterator.
   */
  // next(): IteratorResult<T> {
  //   if (this._pointer < this._paths.length) {
  //     return {
  //       done: false,
  //       value: this.at(this._pointer++)
  //     }
  //   } else {
  //     return {
  //       done: true,
  //       value: undefined
  //     };
  //   }
  // }

  /**
   * Implements Iterable.
   */
  // [Symbol.iterator]() {
  //   return this;
  // }

  toList(): T[] {
    return this.map(node => node);
  }

  map(func: (node: T, index?: number) => any): any[] {
    return this._paths.map((value, index, array) =>
      func(this.getTypedNode(index), index));
  }

  filter(predicate: (node: T, index?: number) => boolean): this {
    this._paths = this._paths.filter((value, index) => predicate(this.getTypedNode(index), index));
    return this;
  }

  forEach(func: (node: T, index?: number) => any): this {
    this._paths.forEach((value, index) => func(this.getTypedNode(index), index));
    return this;
  }

  /**
   * Returns true if the predicate evaluates to true for any node in the
   * collection.
   */
  has(func: (node: T, index?: number) => any): boolean {
    for (let i = 0; i < this._paths.length; i++) {
      if (func(this.getTypedNode(i), i)) {
        return true;
      }
    }
    return false;
  }

  push(node: T): this {
    this._paths.push(node.path);
    return this;
  }

  pushPath(path: ast.NodePath): this {
    this._paths.push(path);
    return this;
  }

  removeAll(): this {
    this._paths.forEach(path => path.prune());
    return this;
  }

  nodes<T extends ast.Node>(): T[] {
    return this._paths.map(p => <T>p.value);
  }

  protected getTypedNode(index: number): T {
    if (index >= this._paths.length) {
      throw new Error('Index out of bounds');
    }
    if (this._type) {
      const node = new this._type();
      node.path = this._paths[index];
      return node;
    }
    return <T>JsNode.fromPath(this._paths[index]);
  }
}

/**
 * Represents a node in the AST tree.
 */
export class JsNode<T extends ast.Node, P> {
  protected _path: ast.NodePath;

  public props: P;

  static fromNode<T extends GenericJsNode>(astNode: ast.Node): T {
    let node = JsNodeFactory.create<T>(astNode.type.toString());
    node.node = astNode;
    return node;
  }

  static fromPath<T extends GenericJsNode>(path: ast.NodePath): T {
    const node = JsNodeFactory.create<T>(path.value.type.toString());
    node.path = path;
    return node;
  }

  static fromModuleCode(code: string, args?: Object): File {
    return <File>JsNode.parse(code, args);
  }

  static fromCode<T extends GenericJsNode>(code: string, args?: Object): JsNodeList<T> {
    return JsNode
      .parse(code, args)
      .descend(n => n.node.type === 'Program')
      .children<T>();
  }

  // for jscodeshift
  // static fromCollection(collection: Collection): GenericJsNode {
  //   return JsNode.fromPath(collection.get());
  // }

  static fromExpressionStatement(code: string, args?: Object): GenericJsNode {
    return JsNode
      .parse(`() => ${code}`, args)
      .descend(n => n.node.type === 'ArrowFunctionExpression')
      .descend();
  }

  static fromFunctionBody<T extends GenericJsNode>(code: string, args?: Object): JsNodeList<T> {
    return JsNode
      .parse(`() => {${code}}`, args)
      .descend(n => n.node.type === 'BlockStatement')
      .children<T>();
  }

  static parse(code: string, args?: Object) {
    return JsNode.fromPath(new ast.NodePath(recast.parse(code, args)));
  }

  get sourceLocation() {
    return this.node.loc;
  }

  set sourceLocation(value: ast.SourceLocation) {
    this.node.loc = value;
  }

  hasParent(): boolean {
    return !!this._path && !!this._path.parent;
  }

  /**
   * Returns the source code for the

   */
  format(): string {
    return recast.print(this._path.value).code.replace(/\r/g, '');
  }

  /**
   * Returns a path object for the current AST root.
   *
   * For more information about Paths, see:
   * https://github.com/benjamn/ast-types
   */
  get path(): ast.NodePath {
    return this._path;
  }

  set path(path: ast.NodePath) {
    this._path = path;
  }

  /**
   * Returns a node object for the current AST root.
   *
   * For more information about Paths, see:
   * https://github.com/benjamn/ast-types
   */
  get node(): T {
    return this.path ? <T>this._path.value : null;
  }

  set node(node: T) {
    this._path = new ast.NodePath(node);
  }

  build(props: P, children: any[]): JsNode<T, P> {
    this.props = props;
    if (!this.node || !this.node.type) {
      throw new Error(`${this.constructor.name}.build() did not assign a valid node`);
    }
    return this;
  }

  /**
   * Returns the type string for the current AST root, as specified by the
   * Mozilla Parser API:
   *
   * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
   */
  type(): string {
    return this._path.value.type;
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

  /**
   * Descends the AST and returns the next node that satisfies the
   * predicate callback.
   */
  descend<T extends GenericJsNode>(predicate?: (node: GenericJsNode) => boolean): T {
    let result: ast.NodePath;
    const self = this.node;
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        if (p.node === self) {
          this.traverse(p);
        } else if (!result) {
          const node = JsNode.fromPath(p);
          if (!predicate || predicate(node)) {
            result = p;
            return false;
          }
          this.traverse(p);
        } else {
          return false;
        }
      }
    });
    if (result) {
      return JsNode.fromPath<T>(result);
    }
  }

  /**
   * Descends the AST and returns all nodes that satisfies the predicate.
   */
  findChildren<T extends GenericJsNode>(predicate: (node: T) => boolean,
    includeSelf: boolean = false): JsNodeList<T> {

    let result = new JsNodeList<T>();
    const self = this.node;
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        if (p.node === self && !includeSelf) {
          this.traverse(p);
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
   * Descends the AST and returns the first node of a given type that satisfies
   * the predicate.
   */
  findFirstChildOfType<T extends GenericJsNode>(
    type: JsNodeType<T>, predicate?: (node: T) => boolean,
    includeSelf: boolean = false): T {

    let result: T;
    const self = this.node;
    const node = new type();
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        if (p.node === self && !includeSelf) {
          this.traverse(p);
        } else if (!result) {
          node.path = p;
          if (node.check(type) && (!predicate || predicate(node))) {
            result = node;
            return false;
          }
          this.traverse(p);
        } else {
          return false;
        }
      }
    });
    if (result) {
      return result;
    }
  }

  /**
   * Descends the AST and returns all nodes of a given type that satisfy the
   * predicate.
   */
  findChildrenOfType<T extends GenericJsNode>(
    type: JsNodeType<T>, predicate?: (node: T) => boolean,
    includeSelf: boolean = false): JsNodeList<T> {

    let result = new JsNodeList<T>(type);
    const self = this.node;
    const node = new type();
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        if (p.node === self && !includeSelf) {
          this.traverse(p);
        } else {
          node.path = p;
          if (node.check(type) && (!predicate || predicate(node))) {
            result.pushPath(p);
          }
          this.traverse(p);
        }
      }
    });
    return result;
  }

  findClosestParentOfType<T extends GenericJsNode>(type: JsNodeType<T>): T {
    const matchedNode = <T>this.ascend(node => node.check(type));
    if (matchedNode) {
      // We can't just return matchedNode since it will always be a registered
      // type. In case we are looking for a complex type, we need to explicitly
      // construct it from the matched node.
      const node = new type();
      node.path = matchedNode.path;
      return node;
    }
  }

  findClosestScope(): GenericJsNode {
    const scope = this._path.scope && this._path.scope.path;
    if (scope) {
      return JsNode.fromPath(scope);
    }
  }

  /**
   * Ascends the AST and returns the first parent node that satisfies the
   * predicate callback.
   */
  ascend<T extends GenericJsNode>(predicate?: (node: GenericJsNode) => boolean): T {
    if (this._path.parent) {
      let currentPath = this._path.parent;
      if (predicate) {
        while (currentPath && !predicate(JsNode.fromPath(currentPath))) {
          currentPath = currentPath.parent;
        }
      }
      if (currentPath) {
        return JsNode.fromPath<T>(currentPath);
      }
    }
  }

  /**
   * Finds the first parent node of a given type.
   */
  findParentOfType<T extends GenericJsNode>(type: JsNodeType<T>): T {
    const matchedNode = <T>this.ascend(node => node.check(type));
    // See findClosestParentOfType()
    const node = new type();
    node.path = matchedNode.path;
    return node;
  }

  /**
   * Returns the node at the root of the current AST.
   */
  getRoot<T extends GenericJsNode>(): T {
    if (this._path.parent) {
      let path = this._path;
      while (path.parent) {
        path = path.parent;
      }
      return JsNode.fromPath<T>(path);
    }
  }

  /**
   * Replaces the current node with another.
   */
  replace(node: (GenericJsNode | ast.Node)): this {
    let astNode = this.toAstNode(node);
    if (!this._path.parent) {
      this._path = new ast.NodePath(astNode);
    } else {
      this._path.replace(astNode);
    }
    return this;
  }

  /**
   * Removes the sub-tree from the AST that has this node at the root.
   */
  remove(): void {
    if (this._path.parent) {
      this._path.prune();
    }
  }

  /**
   * Returns child nodes.
   */
  children<T extends GenericJsNode>(): JsNodeList<T> {
    const self = this.node;
    let children = new JsNodeList<T>();
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
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
  removeChildren(predicate?: (node: GenericJsNode) => boolean): this {
    const self = this.node;
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        if (p.parent && p.parent.node === self) {
          const node = JsNode.fromPath(p);
          if (predicate === undefined || predicate(node)) {
            p.prune();
          }
        }
        this.traverse(p);
      }
    });
    return this;
  }

  /**
   * Removes all child matching descendants.
   */
  removeDescendants(predicate: (node: GenericJsNode) => boolean): this {
    visit(this.node, {
      visitNode: function (p: ast.NodePath) {
        const node = JsNode.fromPath(p);
        if (predicate(node)) {
          p.prune();
        }
        this.traverse(p);
      }
    });
    return this;
  }

  /**
   * Inserts a new node as a sibling of the current node.
   */
  insertBefore(node: (GenericJsNode | ast.Node)): this {
    this._path.insertBefore(this.toAstNode(node));
    return this;
  }

  /**
   * Inserts a new node as a sibling of the current node.
   */
  insertAfter(node: (GenericJsNode | ast.Node)): this {
    this._path.insertAfter(this.toAstNode(node));
    return this;
  }

  /**
   * Helper to unwrap a node to an ast-types node.
   */
  protected toAstNode(node: (GenericJsNode | ast.Node)): ast.Node {
    return (node instanceof JsNode) ? node.node : node;
  }

  /**
   * Gets the node that wraps a property of the current node.
   */
  protected getNode<T extends GenericJsNode>(propertyName: string): T {
    return JsNode.fromPath<T>(this._path.get(propertyName));
  }

  /**
   * Get a list of nodes that wrap a property of the current node.
   */
  protected getNodes<T extends GenericJsNode>(propertyName: string, type?: JsNodeType<T>): JsNodeList<T> {
    return JsNodeList.fromPath(this._path.get(propertyName), type);
  }

  /**
   * Returns the AST node if the argument is a JsNode. Calls the fallback
   * callback, otherwise.
   */
  protected getNodeOrFallback<T extends ast.Node>(obj: (string | GenericJsNode),
    fallback: (s: string) => T): T {

    return (typeof obj === 'string') ? <T>fallback(obj) : <T>obj.node;
  }

  /**
   * Repairs the node after modifications occurred somewhere in its AST.
   *
   * This re-establishes all parent relationships.
   */
  protected repair(): this {
    // TODO
    // this.path = JsNode.fromCollection(js(this.node)).path;
    return this;
  }

  protected morph<T extends GenericJsNode>(type: JsNodeType<T>): T {
    let node = new type();
    node.path = this.path;
    return node;
  }
}

// Use global augmentation to resolve JsCode types
declare global {
  namespace JSX {
    interface Element extends GenericJsNode { }
    interface ElementAttributesProperty {
      props: any;
    }
  }
}
