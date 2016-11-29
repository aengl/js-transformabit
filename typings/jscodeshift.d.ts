/**
 * Type declarations for jscodeshift.
 *
 * https://github.com/facebook/jscodeshift
 */

/// <reference path="ast-types.d.ts" />

/**
 * This top level import makes TypeScript think that this is a module and would
 * normally cause typings to fail. We override this behaviour using a compiler
 * flag, see this for details: http://stackoverflow.com/questions/37641960/
 */
import { Node, Path } from 'ast-types';

type ConvertibleToCollection = (string | Node | Array<Node> | Path | Array<Path>);

export namespace jscodeshift {
    class Collection {
        constructor(paths: Array<Path>, parent: Collection, types?: Array<any>);
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

declare module 'jscodeshift' {
    var core: {
        (obj: ConvertibleToCollection, options?: Object): jscodeshift.Collection;
    };
    export = core;
}
