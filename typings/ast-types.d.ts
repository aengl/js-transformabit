/**
 * Type declarations for ast-types.
 *
 * https://github.com/benjamn/ast-types
 */

declare module 'ast-types' {

    import * as estree from 'estree';

    type ConvertibleToType = (Type | Def | estree.Node | Array<Type | Def | estree.Node>);

    class Type {
        static or(...args: Array<ConvertibleToType>): Type;
        static fromArray(arr: Array<ConvertibleToType>): Type;
        static fromObject(obj: estree.Node): Type;
        static def(typeName: string): Type;

        name: string;

        constructor(check: Function, name: (Function | string));
        check(value: any, deep?: boolean): boolean;
        assert(value: any, deep?: boolean): boolean;
        toString(): string;
        arrayOf(): Type;
    }

    class Field {
        constructor(name: string, type: ConvertibleToType, defaultFn: Function, hidden?: Boolean);
        toString(): string;
        getValue(obj: estree.Node): any;
    }

    class Def {
        static fromValue(value: estree.Node): (Def | void);

        constructor(typeName: string);
        isSupertypeOf(that: Def): boolean;
        checkAllFields(value: estree.Node, deep: boolean): boolean;
        check(value: estree.Node, deep?: boolean): boolean;
        bases(): Def;
        build(...args: any[]): Def;
        getBuilderName(typeName: string): string;
        getStatementBuilderName(typeName: string): string;
        field(name: string, type: any, defaultFn: Function, hidden?: boolean): Def;
        finalize(): void;
    }

    class Path {
        value: estree.Node;
        parentPath: Path;
        name: string;

        constructor(value: Path, parentPath?: Path, name?: string);
        getValueProperty(name: string): string;
        get(name: string): string;
        each(callback: (childPath: Path) => void, context?: Path): void;
        map(callback: (childPath: Path) => Path, context?: Path): Array<Path>;
        filter(callback: (childPath: Path) => boolean, context?: Path): Array<Path>;
        shift(): void;
        unshift(...nodes: Array<Path>): void;
        push(...nodes: Array<Path>): void;
        pop(): Path;
        insertAt(index: number, node: Path): Path;
        insertBefore(node: Path): Path;
        insertAfter(node: Path): Path;
        replace(replacement: Path): Array<Path>;
    }

    function getSupertypeNames(typeName: string): string;

    var builtInTypes: {
        string: Type,
        function: Type,
        array: Type,
        object: Type,
        RegExp: Type,
        Date: Type,
        number: Type,
        boolean: Type,
        null: Type,
        undefined: Type
    };

    var namedTypes: {
        Printable: Type,
        SourceLocation: Type,
        Node: Type,
        Comment: Type,
        Position: Type,
        File: Type,
        Program: Type,
        Statement: Type,
        Function: Type,
        Pattern: Type,
        Expression: Type,
        Identifier: Type,
        BlockStatement: Type,
        EmptyStatement: Type,
        ExpressionStatement: Type,
        IfStatement: Type,
        LabeledStatement: Type,
        BreakStatement: Type,
        ContinueStatement: Type,
        WithStatement: Type,
        SwitchStatement: Type,
        SwitchCase: Type,
        ReturnStatement: Type,
        ThrowStatement: Type,
        TryStatement: Type,
        CatchClause: Type,
        WhileStatement: Type,
        DoWhileStatement: Type,
        ForStatement: Type,
        Declaration: Type,
        VariableDeclaration: Type,
        ForInStatement: Type,
        DebuggerStatement: Type,
        FunctionDeclaration: Type,
        FunctionExpression: Type,
        VariableDeclarator: Type,
        ThisExpression: Type,
        ArrayExpression: Type,
        ObjectExpression: Type,
        Property: Type,
        Literal: Type,
        SequenceExpression: Type,
        UnaryExpression: Type,
        BinaryExpression: Type,
        AssignmentExpression: Type,
        UpdateExpression: Type,
        LogicalExpression: Type,
        ConditionalExpression: Type,
        NewExpression: Type,
        CallExpression: Type,
        MemberExpression: Type,
        RestElement: Type,
        SpreadElementPattern: Type,
        ArrowFunctionExpression: Type,
        YieldExpression: Type,
        GeneratorExpression: Type,
        ComprehensionBlock: Type,
        ComprehensionExpression: Type,
        PropertyPattern: Type,
        ObjectPattern: Type,
        ArrayPattern: Type,
        MethodDefinition: Type,
        SpreadElement: Type,
        AssignmentPattern: Type,
        ClassPropertyDefinition: Type,
        ClassProperty: Type,
        ClassBody: Type,
        ClassDeclaration: Type,
        ClassExpression: Type,
        ClassImplements: Type,
        Specifier: Type,
        ModuleSpecifier: Type,
        TaggedTemplateExpression: Type,
        TemplateLiteral: Type,
        TemplateElement: Type,
        SpreadProperty: Type,
        SpreadPropertyPattern: Type,
        AwaitExpression: Type,
        ForOfStatement: Type,
        LetStatement: Type,
        LetExpression: Type,
        GraphExpression: Type,
        GraphIndexExpression: Type,
        XMLDefaultDeclaration: Type,
        XMLAnyName: Type,
        XMLQualifiedIdentifier: Type,
        XMLFunctionQualifiedIdentifier: Type,
        XMLAttributeSelector: Type,
        XMLFilterExpression: Type,
        XML: Type,
        XMLElement: Type,
        XMLList: Type,
        XMLEscape: Type,
        XMLText: Type,
        XMLStartTag: Type,
        XMLEndTag: Type,
        XMLPointTag: Type,
        XMLName: Type,
        XMLAttribute: Type,
        XMLCdata: Type,
        XMLComment: Type,
        XMLProcessingInstruction: Type,
        JSXAttribute: Type,
        JSXIdentifier: Type,
        JSXNamespacedName: Type,
        JSXExpressionContainer: Type,
        JSXMemberExpression: Type,
        JSXSpreadAttribute: Type,
        JSXElement: Type,
        JSXOpeningElement: Type,
        JSXClosingElement: Type,
        JSXText: Type,
        JSXEmptyExpression: Type,
        Type: Type,
        AnyTypeAnnotation: Type,
        EmptyTypeAnnotation: Type,
        MixedTypeAnnotation: Type,
        VoidTypeAnnotation: Type,
        NumberTypeAnnotation: Type,
        NumberLiteralTypeAnnotation: Type,
        StringTypeAnnotation: Type,
        StringLiteralTypeAnnotation: Type,
        BooleanTypeAnnotation: Type,
        BooleanLiteralTypeAnnotation: Type,
        TypeAnnotation: Type,
        NullableTypeAnnotation: Type,
        NullLiteralTypeAnnotation: Type,
        NullTypeAnnotation: Type,
        ThisTypeAnnotation: Type,
        ExistsTypeAnnotation: Type,
        ExistentialTypeParam: Type,
        FunctionTypeAnnotation: Type,
        FunctionTypeParam: Type,
        TypeParameterDeclaration: Type,
        ArrayTypeAnnotation: Type,
        ObjectTypeAnnotation: Type,
        ObjectTypeProperty: Type,
        ObjectTypeIndexer: Type,
        ObjectTypeCallProperty: Type,
        QualifiedTypeIdentifier: Type,
        GenericTypeAnnotation: Type,
        TypeParameterInstantiation: Type,
        MemberTypeAnnotation: Type,
        UnionTypeAnnotation: Type,
        IntersectionTypeAnnotation: Type,
        TypeofTypeAnnotation: Type,
        TypeParameter: Type,
        InterfaceDeclaration: Type,
        InterfaceExtends: Type,
        DeclareInterface: Type,
        TypeAlias: Type,
        DeclareTypeAlias: Type,
        TypeCastExpression: Type,
        TupleTypeAnnotation: Type,
        DeclareVariable: Type,
        DeclareFunction: Type,
        DeclareClass: Type,
        DeclareModule: Type,
        DeclareModuleExports: Type,
        DeclareExportDeclaration: Type,
        ExportSpecifier: Type,
        ExportBatchSpecifier: Type,
        ImportSpecifier: Type,
        ImportNamespaceSpecifier: Type,
        ImportDefaultSpecifier: Type,
        ExportDeclaration: Type,
        ImportDeclaration: Type,
        Block: Type,
        Line: Type,
        Noop: Type,
        DoExpression: Type,
        Super: Type,
        BindExpression: Type,
        Decorator: Type,
        MetaProperty: Type,
        ParenthesizedExpression: Type,
        ExportDefaultDeclaration: Type,
        ExportNamedDeclaration: Type,
        ExportNamespaceSpecifier: Type,
        ExportDefaultSpecifier: Type,
        ExportAllDeclaration: Type,
        CommentBlock: Type,
        CommentLine: Type,
        Directive: Type,
        DirectiveLiteral: Type,
        StringLiteral: Type,
        NumericLiteral: Type,
        NullLiteral: Type,
        BooleanLiteral: Type,
        RegExpLiteral: Type,
        ObjectMethod: Type,
        ObjectProperty: Type,
        ClassMethod: Type,
        RestProperty: Type,
        ForAwaitStatement: Type
    };

    var builders: {[name: string]: (...args: Array<any>) => estree.Node};
}
