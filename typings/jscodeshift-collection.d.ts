/**
 * Exposes the Collection type for jscodeshift.
 *
 * https://github.com/facebook/jscodeshift
 */

/// <reference path="ast-types.d.ts" />

declare module 'jscodeshift-collection' {
    import { Node, Path } from 'ast-types';

    export type ConvertibleToCollection = (string | Node | Array<Node> | Path | Array<Path>);

    export interface Collection {
        (paths: Array<Path>, parent: Collection, types?: Array<any>): Collection;
        filter(callback: (childPath: Path) => boolean): Collection;
        forEach(callback: (path: Path, i: number, paths: Array<Path>) => void): void;
        map(callback: (path: Path, ...args: Array<any>) => (Path | Array<Path>), type: any, ...args: Array<any>): Collection;
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
        getVariableDeclarators(nameGetter: (path: Path, ...args: Array<any>) => string, ...args: Array<any>): Collection;
    }
}
