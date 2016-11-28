/**
 * Type declarations for ast-types.
 *
 * https://github.com/benjamn/ast-types
 */

declare module ast {
    type ConvertibleToType = (Type | Def | Object | Array<Type | Def | Object>);

    class Type {
        static or(...args: Array<ConvertibleToType>): Type;
        static fromArray(arr: Array<ConvertibleToType>): Type;
        static fromObject(obj: Object): Type;
        static def(typeName: string): Type;

        constructor(check: Function, name: (Function | string));
        assert(value: Object, deep?: boolean): boolean;
        toString(): string;
        arrayOf(): Type;
    }

    class Field {
        constructor(name: string, type: ConvertibleToType, defaultFn: Function, hidden: Boolean);
        toString(): string;
        getValue(obj: Object): any;
    }

    class Def {
        static fromValue(value: Object): (Def | void);

        constructor(typeName: string);
        isSupertypeOf(that: Def): boolean;
        checkAllFields(value: Object, deep: boolean): boolean;
        check(value: Object, deep?: boolean): boolean;
        bases(): Def;
        build(...args: any[]): Def;
        getBuilderName(typeName: string): string;
        getStatementBuilderName(typeName: string): string;
        field(name: string, type: any, defaultFn: Function, hidden: boolean): Def;
        finalize(): void;
    }

    function getSupertypeNames(typeName: string): string;
}

export = ast;
