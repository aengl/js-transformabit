/**
 * Exposes the Collection type for jscodeshift.
 *
 * https://github.com/facebook/jscodeshift
 */

declare module 'jscodeshift-collection' {
  import { Node, Path, NodePath } from 'ast-types';

  export type ConvertibleToCollection = (string | Node | Array<Node> | Path | Array<Path>);
  export type NodeFunction = (path: NodePath, i: number) => (Node | Array<Node>);

  export interface Collection {
    (paths: Array<Path>, parent: Collection, types?: Array<any>): Collection;
    filter(callback: (childPath: NodePath) => boolean): Collection;
    forEach(callback: (path: NodePath, i: number, paths: Array<NodePath>) => void): void;
    map(callback: (path: NodePath, ...args: Array<any>) => (NodePath | Array<NodePath>),
      type: any, ...args: Array<any>): Collection;
    size(): number;
    length(): number;
    nodes(): Array<Node>;
    paths(): Array<Path>;
    getAST(): Array<Path>;
    toSource(options?: Object): string;
    at(index: number): Collection;
    get(): Path;
    getTypes(): Array<string>;
    isOfType(type: any): boolean;

    // Typed methods for Node
    find(type: any, filter: Object): Collection;
    closestScope(): Collection;
    closest(type: any, filter: Object): Collection;
    getVariableDeclarators(nameGetter: (path: Path, ...args: Array<any>)
      => string, ...args: Array<any>): Collection;
    replaceWith(nodes: (Node | Array<Node> | NodeFunction)): void;
    insertAfter(insert: (Node | Array<Node> | NodeFunction)): void;
    remove(): void;
  }
}
