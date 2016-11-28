/**
 * Type declarations for jscodeshift.
 *
 * https://github.com/facebook/jscodeshift
 */

declare module "jscodeshift" {
    import * as ast from 'ast-types';
    import * as estree from 'estree';
    export = jscodeshift;

    type ConvertibleToCollection =
        (string | estree.Node | Array<estree.Node> | ast.Path | Array<ast.Path> | Collection);

    function jscodeshift(obj: ConvertibleToCollection, options?: Object): Collection;

    class Collection {
        constructor(paths: Array<ast.Path>, parent: Collection, types?: Array<any>);
        filter(callback: (childPath: ast.Path) => boolean): Collection;
        forEach(callback: (path: ast.Path, i: number, paths: Array<ast.Path>) => void): void;
        map(callback: (path: ast.Path, ...args: Array<any>) => (ast.Path | Array<ast.Path>), type: any, ...args: Array<any>): Collection;
        size(): number;
        length(): number;
        nodes(): Array<estree.Node>;
        paths(): Array<ast.Path>;
        getAST(): Array<ast.Path>;
        toSource(options?: Object): string;
        at(index: number): Collection;
        get(): ast.Path;
        getTypes(): Array<string>;
        isOfType(type: any): boolean;

        // Typed methods for Node
        find(type: any, filter: Object): Collection;
        closestScope(): Collection;
        closest(type: any, filter: Object): Collection;
        getVariableDeclarators(nameGetter: (path: ast.Path, ...args: Array<any>) => string, ...args: Array<any>): Collection;
    }
}
