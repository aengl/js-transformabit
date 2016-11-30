/**
 * Type declarations for ast-types.
 *
 * https://github.com/benjamn/ast-types
 */

declare module 'ast-types' {
    import * as estree from 'estree';

    type Node = estree.Node;
    type Assignable = (Literal | Identifier);

    type ConvertibleToType = (Type | Def | Node | Array<Type | Def | Node>);

    function defineMethod(name: string, func: Function): Function;
    function getFieldNames(object: Node): string[];
    function getFieldValue(object: Node, fieldName: string): any;
    function eachField(object: Node, callback: (name: string, value: any) => void, context?: Object): void;
    function someField(object: Node, callback: (name: string, value: any) => void, context?: Object): string[];
    function getSupertypeNames(typeName: string): string;
    function astNodesAreEquivalent(): void;
    function finalize(): void;
    function use(plugin: any): any;
    function visit(node: Node, methods: Object): void; // TODO: return PathVisitor

    class Type {
        static or(...args: Array<ConvertibleToType>): Type;
        static fromArray(arr: Array<ConvertibleToType>): Type;
        static fromObject(obj: Node): Type;
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
        getValue(obj: Node): any;
    }

    class Def {
        static fromValue(value: Node): (Def | void);

        constructor(typeName: string);
        isSupertypeOf(that: Def): boolean;
        checkAllFields(value: Node, deep: boolean): boolean;
        check(value: Node, deep?: boolean): boolean;
        bases(): Def;
        build(...args: any[]): Def;
        getBuilderName(typeName: string): string;
        getStatementBuilderName(typeName: string): string;
        field(name: string, type: any, defaultFn: Function, hidden?: boolean): Def;
        finalize(): void;
    }

    class Path {
        value: Node;
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
        insertAt(index: number, node: Node): Path;
        insertBefore(node: Node): Path;
        insertAfter(node: Node): Path;
        replace(replacement: Node): Array<Path>;
    }

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

    var builders: {[name: string]: (...args: Array<any>) => Node};

    // type Printable = estree.Printable;
    type SourceLocation = estree.SourceLocation;
    // type Node = Node;
    type Comment = estree.Comment;
    type Position = estree.Position;
    // type File = estree.File;
    type Program = estree.Program;
    type Statement = estree.Statement;
    type Function = estree.Function;
    type Pattern = estree.Pattern;
    type Expression = estree.Expression;
    type Identifier = estree.Identifier;
    type BlockStatement = estree.BlockStatement;
    type EmptyStatement = estree.EmptyStatement;
    type ExpressionStatement = estree.ExpressionStatement;
    type IfStatement = estree.IfStatement;
    type LabeledStatement = estree.LabeledStatement;
    type BreakStatement = estree.BreakStatement;
    type ContinueStatement = estree.ContinueStatement;
    type WithStatement = estree.WithStatement;
    type SwitchStatement = estree.SwitchStatement;
    type SwitchCase = estree.SwitchCase;
    type ReturnStatement = estree.ReturnStatement;
    type ThrowStatement = estree.ThrowStatement;
    type TryStatement = estree.TryStatement;
    type CatchClause = estree.CatchClause;
    type WhileStatement = estree.WhileStatement;
    type DoWhileStatement = estree.DoWhileStatement;
    type ForStatement = estree.ForStatement;
    type Declaration = estree.Declaration;
    type VariableDeclaration = estree.VariableDeclaration;
    type ForInStatement = estree.ForInStatement;
    type DebuggerStatement = estree.DebuggerStatement;
    type FunctionDeclaration = estree.FunctionDeclaration;
    type FunctionExpression = estree.FunctionExpression;
    type VariableDeclarator = estree.VariableDeclarator;
    type ThisExpression = estree.ThisExpression;
    type ArrayExpression = estree.ArrayExpression;
    type ObjectExpression = estree.ObjectExpression;
    type Property = estree.Property;
    type Literal = estree.Literal;
    type SequenceExpression = estree.SequenceExpression;
    type UnaryExpression = estree.UnaryExpression;
    type BinaryExpression = estree.BinaryExpression;
    type AssignmentExpression = estree.AssignmentExpression;
    type UpdateExpression = estree.UpdateExpression;
    type LogicalExpression = estree.LogicalExpression;
    type ConditionalExpression = estree.ConditionalExpression;
    type NewExpression = estree.NewExpression;
    type CallExpression = estree.CallExpression;
    type MemberExpression = estree.MemberExpression;
    type RestElement = estree.RestElement;
    // type SpreadElementPattern = estree.SpreadElementPattern;
    type ArrowFunctionExpression = estree.ArrowFunctionExpression;
    type YieldExpression = estree.YieldExpression;
    // type GeneratorExpression = estree.GeneratorExpression;
    // type ComprehensionBlock = estree.ComprehensionBlock;
    // type ComprehensionExpression = estree.ComprehensionExpression;
    // type PropertyPattern = estree.PropertyPattern;
    type ObjectPattern = estree.ObjectPattern;
    type ArrayPattern = estree.ArrayPattern;
    type MethodDefinition = estree.MethodDefinition;
    type SpreadElement = estree.SpreadElement;
    type AssignmentPattern = estree.AssignmentPattern;
    // type ClassPropertyDefinition = estree.ClassPropertyDefinition;
    // type ClassProperty = estree.ClassProperty;
    type ClassBody = estree.ClassBody;
    type ClassDeclaration = estree.ClassDeclaration;
    type ClassExpression = estree.ClassExpression;
    // type ClassImplements = estree.ClassImplements;
    // type Specifier = estree.Specifier;
    type ModuleSpecifier = estree.ModuleSpecifier;
    type TaggedTemplateExpression = estree.TaggedTemplateExpression;
    type TemplateLiteral = estree.TemplateLiteral;
    type TemplateElement = estree.TemplateElement;
    // type SpreadProperty = estree.SpreadProperty;
    // type SpreadPropertyPattern = estree.SpreadPropertyPattern;
    type AwaitExpression = estree.AwaitExpression;
    type ForOfStatement = estree.ForOfStatement;
    // type LetStatement = estree.LetStatement;
    // type LetExpression = estree.LetExpression;
    // type GraphExpression = estree.GraphExpression;
    // type GraphIndexExpression = estree.GraphIndexExpression;
    // type XMLDefaultDeclaration = estree.XMLDefaultDeclaration;
    // type XMLAnyName = estree.XMLAnyName;
    // type XMLQualifiedIdentifier = estree.XMLQualifiedIdentifier;
    // type XMLFunctionQualifiedIdentifier = estree.XMLFunctionQualifiedIdentifier;
    // type XMLAttributeSelector = estree.XMLAttributeSelector;
    // type XMLFilterExpression = estree.XMLFilterExpression;
    // type XML = estree.XML;
    // type XMLElement = estree.XMLElement;
    // type XMLList = estree.XMLList;
    // type XMLEscape = estree.XMLEscape;
    // type XMLText = estree.XMLText;
    // type XMLStartTag = estree.XMLStartTag;
    // type XMLEndTag = estree.XMLEndTag;
    // type XMLPointTag = estree.XMLPointTag;
    // type XMLName = estree.XMLName;
    // type XMLAttribute = estree.XMLAttribute;
    // type XMLCdata = estree.XMLCdata;
    // type XMLComment = estree.XMLComment;
    // type XMLProcessingInstruction = estree.XMLProcessingInstruction;
    // type JSXAttribute = estree.JSXAttribute;
    // type JSXIdentifier = estree.JSXIdentifier;
    // type JSXNamespacedName = estree.JSXNamespacedName;
    // type JSXExpressionContainer = estree.JSXExpressionContainer;
    // type JSXMemberExpression = estree.JSXMemberExpression;
    // type JSXSpreadAttribute = estree.JSXSpreadAttribute;
    // type JSXElement = estree.JSXElement;
    // type JSXOpeningElement = estree.JSXOpeningElement;
    // type JSXClosingElement = estree.JSXClosingElement;
    // type JSXText = estree.JSXText;
    // type JSXEmptyExpression = estree.JSXEmptyExpression;
    // type Type = estree.Type;
    // type AnyTypeAnnotation = estree.AnyTypeAnnotation;
    // type EmptyTypeAnnotation = estree.EmptyTypeAnnotation;
    // type MixedTypeAnnotation = estree.MixedTypeAnnotation;
    // type VoidTypeAnnotation = estree.VoidTypeAnnotation;
    // type NumberTypeAnnotation = estree.NumberTypeAnnotation;
    // type NumberLiteralTypeAnnotation = estree.NumberLiteralTypeAnnotation;
    // type StringTypeAnnotation = estree.StringTypeAnnotation;
    // type StringLiteralTypeAnnotation = estree.StringLiteralTypeAnnotation;
    // type BooleanTypeAnnotation = estree.BooleanTypeAnnotation;
    // type BooleanLiteralTypeAnnotation = estree.BooleanLiteralTypeAnnotation;
    // type TypeAnnotation = estree.TypeAnnotation;
    // type NullableTypeAnnotation = estree.NullableTypeAnnotation;
    // type NullLiteralTypeAnnotation = estree.NullLiteralTypeAnnotation;
    // type NullTypeAnnotation = estree.NullTypeAnnotation;
    // type ThisTypeAnnotation = estree.ThisTypeAnnotation;
    // type ExistsTypeAnnotation = estree.ExistsTypeAnnotation;
    // type ExistentialTypeParam = estree.ExistentialTypeParam;
    // type FunctionTypeAnnotation = estree.FunctionTypeAnnotation;
    // type FunctionTypeParam = estree.FunctionTypeParam;
    // type TypeParameterDeclaration = estree.TypeParameterDeclaration;
    // type ArrayTypeAnnotation = estree.ArrayTypeAnnotation;
    // type ObjectTypeAnnotation = estree.ObjectTypeAnnotation;
    // type ObjectTypeProperty = estree.ObjectTypeProperty;
    // type ObjectTypeIndexer = estree.ObjectTypeIndexer;
    // type ObjectTypeCallProperty = estree.ObjectTypeCallProperty;
    // type QualifiedTypeIdentifier = estree.QualifiedTypeIdentifier;
    // type GenericTypeAnnotation = estree.GenericTypeAnnotation;
    // type TypeParameterInstantiation = estree.TypeParameterInstantiation;
    // type MemberTypeAnnotation = estree.MemberTypeAnnotation;
    // type UnionTypeAnnotation = estree.UnionTypeAnnotation;
    // type IntersectionTypeAnnotation = estree.IntersectionTypeAnnotation;
    // type TypeofTypeAnnotation = estree.TypeofTypeAnnotation;
    // type TypeParameter = estree.TypeParameter;
    // type InterfaceDeclaration = estree.InterfaceDeclaration;
    // type InterfaceExtends = estree.InterfaceExtends;
    // type DeclareInterface = estree.DeclareInterface;
    // type TypeAlias = estree.TypeAlias;
    // type DeclareTypeAlias = estree.DeclareTypeAlias;
    // type TypeCastExpression = estree.TypeCastExpression;
    // type TupleTypeAnnotation = estree.TupleTypeAnnotation;
    // type DeclareVariable = estree.DeclareVariable;
    // type DeclareFunction = estree.DeclareFunction;
    // type DeclareClass = estree.DeclareClass;
    // type DeclareModule = estree.DeclareModule;
    // type DeclareModuleExports = estree.DeclareModuleExports;
    // type DeclareExportDeclaration = estree.DeclareExportDeclaration;
    type ExportSpecifier = estree.ExportSpecifier;
    // type ExportBatchSpecifier = estree.ExportBatchSpecifier;
    type ImportSpecifier = estree.ImportSpecifier;
    type ImportNamespaceSpecifier = estree.ImportNamespaceSpecifier;
    type ImportDefaultSpecifier = estree.ImportDefaultSpecifier;
    // type ExportDeclaration = estree.ExportDeclaration;
    type ImportDeclaration = estree.ImportDeclaration;
    // type Block = estree.Block;
    // type Line = estree.Line;
    // type Noop = estree.Noop;
    // type DoExpression = estree.DoExpression;
    type Super = estree.Super;
    // type BindExpression = estree.BindExpression;
    // type Decorator = estree.Decorator;
    type MetaProperty = estree.MetaProperty;
    // type ParenthesizedExpression = estree.ParenthesizedExpression;
    type ExportDefaultDeclaration = estree.ExportDefaultDeclaration;
    type ExportNamedDeclaration = estree.ExportNamedDeclaration;
    // type ExportNamespaceSpecifier = estree.ExportNamespaceSpecifier;
    // type ExportDefaultSpecifier = estree.ExportDefaultSpecifier;
    type ExportAllDeclaration = estree.ExportAllDeclaration;
    // type CommentBlock = estree.CommentBlock;
    // type CommentLine = estree.CommentLine;
    // type Directive = estree.Directive;
    // type DirectiveLiteral = estree.DirectiveLiteral;
    // type StringLiteral = estree.StringLiteral;
    // type NumericLiteral = estree.NumericLiteral;
    // type NullLiteral = estree.NullLiteral;
    // type BooleanLiteral = estree.BooleanLiteral;
    // type RegExpLiteral = estree.RegExpLiteral;
    // type ObjectMethod = estree.ObjectMethod;
    // type ObjectProperty = estree.ObjectProperty;
    // type ClassMethod = estree.ClassMethod;
    // type RestProperty = estree.RestProperty;
    // type ForAwaitStatement = estree.ForAwaitStatement;
}
