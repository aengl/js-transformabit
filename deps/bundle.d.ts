export declare namespace ast {
  /**
   * Type declarations for ast-types.
   *
   * https://github.com/benjamn/ast-types
   *
   * Some of the work is based on the estree type definitions:
   * https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/estree
   */

  /* ---------------------------------------------------------------------------
   * Enums
   */

  export type SourceType = 'script' | 'module';

  export type VariableKind = 'var' | 'let' | 'const';

  export type PropertyKind = 'init' | 'get' | 'set';

  export type ObjectMethodKind = 'method' | 'get' | 'set';

  export type UnaryOperator =
    '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete';

  export type BinaryOperator =
    '==' | '!=' | '===' | '!==' | '<' | '<=' | '>' | '>=' | '<<' |
    '>>' | '>>>' | '+' | '-' | '*' | '/' | '%' | '**' | '|' | '^' | '&' | 'in' |
    'instanceof';

  export type LogicalOperator = '||' | '&&';

  export type AssignmentOperator =
    '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '**=' | '<<=' | '>>=' | '>>>=' |
    '|=' | '^=' | '&=';

  export type UpdateOperator = '++' | '--';

  export type MethodKind = 'constructor' | 'method' | 'get' | 'set';

  /* ---------------------------------------------------------------------------
   * Union types
   */

  export type Pattern =
    Identifier | ObjectPattern | ArrayPattern | RestElement |
    AssignmentPattern | MemberExpression;

  export type Function =
    FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

  export type Declaration =
    FunctionDeclaration | VariableDeclaration | ClassDeclaration;

  export type Statement =
    ExpressionStatement | BlockStatement | EmptyStatement |
    DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement |
    BreakStatement | ContinueStatement | IfStatement | SwitchStatement |
    ThrowStatement | TryStatement | WhileStatement | DoWhileStatement |
    ForStatement | ForInStatement | ForOfStatement | Declaration;

  export type Expression =
    ThisExpression | ArrayExpression | ObjectExpression | FunctionExpression |
    ArrowFunctionExpression | YieldExpression | Literal | UnaryExpression |
    UpdateExpression | BinaryExpression | AssignmentExpression |
    LogicalExpression | MemberExpression | ConditionalExpression |
    CallExpression | NewExpression | SequenceExpression | TemplateLiteral |
    TaggedTemplateExpression | ClassExpression | MetaProperty | Identifier |
    AwaitExpression | JSXIdentifier | JSXExpressionContainer;

  export type Class = ClassDeclaration | ClassExpression;

  export type ClassBodyElement =
    MethodDefinition | VariableDeclarator | ClassPropertyDefinition | ClassProperty;

  export type CallExpression = SimpleCallExpression | NewExpression;

  export type Literal = SimpleLiteral | RegExpLiteral;

  export type ModuleDeclaration =
    ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration |
    ExportAllDeclaration;

  export type ModuleSpecifier =
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier |
    ExportSpecifier;

  export type ObjectExpressionProperty =
    Property | ObjectMethod | ObjectProperty | SpreadProperty;

  export type SimpleLiteralValue = string | boolean | number | null;

  export type LiteralValue = SimpleLiteralValue | RegExp;

  export type ArrayExpressionElements = Array<Expression | SpreadElement | RestElement | null>;

  /* ---------------------------------------------------------------------------
   * Common interfaces
   */

  export interface Node {
    type: string;
    leadingComments?: Array<Comment>;
    trailingComments?: Array<Comment>;
    loc?: SourceLocation;
    range?: [number, number];
    [propName: string]: any;
  }

  export interface SourceLocation {
    source?: string;
    start: Position;
    end: Position;
  }

  export interface Comment {
    value: string;
  }

  export interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
  }

  interface BasePattern extends Node {}

  interface BaseStatement extends Node {}

  interface BaseDeclaration extends BaseStatement {}

  interface BaseModuleDeclaration extends Node {}

  interface BaseModuleSpecifier extends Node {
    local: Identifier;
  }

  interface BaseClass extends Node {
    superClass?: Expression;
    body: ClassBody;
  }

  interface BaseFunction extends Node {
    params: Array<Pattern>;
    generator?: boolean;
    async?: boolean;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
  }

  interface BaseForXStatement extends BaseStatement {
    left: VariableDeclaration | Expression;
    right: Expression;
    body: Statement;
  }

  interface BaseCallExpression extends BaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
  }

  /* ---------------------------------------------------------------------------
   * Nodes
   */

  export interface File {
    type: 'File';
    program: Program;
    loc?: SourceLocation;
    comments?: any; // No idea what that is for
  }

  export interface Program extends Node {
    type: 'Program';
    sourceType: SourceType;
    body: Array<Statement | ModuleDeclaration>;
  }

  export interface EmptyStatement extends BaseStatement {
    type: 'EmptyStatement';
  }

  export interface BlockStatement extends BaseStatement {
    type: 'BlockStatement';
    body: Array<Statement>;
  }

  export interface ExpressionStatement extends BaseStatement {
    type: 'ExpressionStatement';
    expression: Expression;
  }

  export interface IfStatement extends BaseStatement {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate?: Statement;
  }

  export interface LabeledStatement extends BaseStatement {
    type: 'LabeledStatement';
    label: Identifier;
    body: Statement;
  }

  export interface BreakStatement extends BaseStatement {
    type: 'BreakStatement';
    label?: Identifier;
  }

  export interface ContinueStatement extends BaseStatement {
    type: 'ContinueStatement';
    label?: Identifier;
  }

  export interface WithStatement extends BaseStatement {
    type: 'WithStatement';
    object: Expression;
    body: Statement;
  }

  export interface SwitchStatement extends BaseStatement {
    type: 'SwitchStatement';
    discriminant: Expression;
    cases: Array<SwitchCase>;
  }

  export interface ReturnStatement extends BaseStatement {
    type: 'ReturnStatement';
    argument?: Expression;
  }

  export interface ThrowStatement extends BaseStatement {
    type: 'ThrowStatement';
    argument: Expression;
  }

  export interface TryStatement extends BaseStatement {
    type: 'TryStatement';
    block: BlockStatement;
    handler?: CatchClause;
    finalizer?: BlockStatement;
  }

  export interface WhileStatement extends BaseStatement {
    type: 'WhileStatement';
    test: Expression;
    body: Statement;
  }

  export interface DoWhileStatement extends BaseStatement {
    type: 'DoWhileStatement';
    body: Statement;
    test: Expression;
  }

  export interface ForStatement extends BaseStatement {
    type: 'ForStatement';
    init?: VariableDeclaration | Expression;
    test?: Expression;
    update?: Expression;
    body: Statement;
  }

  export interface ForInStatement extends BaseForXStatement {
    type: 'ForInStatement';
  }

  export interface DebuggerStatement extends BaseStatement {
    type: 'DebuggerStatement';
  }

  export interface FunctionDeclaration extends BaseFunction, BaseDeclaration {
    type: 'FunctionDeclaration';
    id: Identifier;
    body: BlockStatement;
  }

  export interface VariableDeclaration extends BaseDeclaration {
    type: 'VariableDeclaration';
    declarations: Array<VariableDeclarator>;
    kind: VariableKind;
  }

  export interface VariableDeclarator extends Node {
    type: 'VariableDeclarator';
    id: Pattern;
    init?: Expression;
  }

  export interface BaseExpression extends Node { }

  export interface ThisExpression extends BaseExpression {
    type: 'ThisExpression';
  }

  export interface ArrayExpression extends BaseExpression {
    type: 'ArrayExpression';
    elements: ArrayExpressionElements;
  }

  export interface Property extends Node {
    type: 'Property';
    key: Expression;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: PropertyKind;
    method: boolean;
    shorthand: boolean;
    computed: boolean;
  }

  export interface FunctionExpression extends BaseFunction, BaseExpression {
    id?: Identifier;
    type: 'FunctionExpression';
    body: BlockStatement;
  }

  export interface SequenceExpression extends BaseExpression {
    type: 'SequenceExpression';
    expressions: Array<Expression>;
  }

  export interface UnaryExpression extends BaseExpression {
    type: 'UnaryExpression';
    operator: UnaryOperator;
    prefix: boolean;
    argument: Expression;
  }

  export interface JSXIdentifier extends BaseExpression {
    type: 'JSXIdentifier';
    name: string;
  }

  export interface JSXElement extends Node {
    type: 'JSXElement';
    openingElement: JSXOpeningElement;
    closingElement: JSXClosingElement;
    children: (Literal | JSXExpressionContainer | JSXElement)[]
  }

  export interface JSXOpeningElement extends Node {
    type: 'JSXOpeningElement';
    name: JSXIdentifier;
    attributes: JSXAttribute[];
    selfClosing: boolean;
  }


  export interface JSXClosingElement extends Node {
    type: 'JSXClosingElement';
    name: JSXIdentifier;
  }

  export interface JSXAttribute extends Node {
    type: 'JSXAttribute';
    name: JSXIdentifier;
    value: Literal | JSXExpressionContainer
  }

  export interface JSXExpressionContainer extends BaseExpression {
    type: 'JSXExpressionContainer';
    expression: Expression;
  }

  export interface BinaryExpression extends BaseExpression {
    type: 'BinaryExpression';
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
  }

  export interface AssignmentExpression extends BaseExpression {
    type: 'AssignmentExpression';
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
  }

  export interface UpdateExpression extends BaseExpression {
    type: 'UpdateExpression';
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
  }

  export interface LogicalExpression extends BaseExpression {
    type: 'LogicalExpression';
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
  }

  export interface ConditionalExpression extends BaseExpression {
    type: 'ConditionalExpression';
    test: Expression;
    alternate: Expression;
    consequent: Expression;
  }

  export interface SimpleCallExpression extends BaseCallExpression {
    type: 'CallExpression';
  }

  export interface NewExpression extends BaseCallExpression {
    type: 'NewExpression';
  }

  export interface MemberExpression extends BaseExpression, BasePattern {
    type: 'MemberExpression';
    object: Expression | Super;
    property: Expression;
    computed: boolean;
  }

  export interface SwitchCase extends Node {
    type: 'SwitchCase';
    test?: Expression;
    consequent: Array<Statement>;
  }

  export interface CatchClause extends Node {
    type: 'CatchClause';
    param: Pattern;
    body: BlockStatement;
  }

  export interface Identifier extends Node, BaseExpression, BasePattern {
    type: 'Identifier';
    name: string;
  }

  export interface SimpleLiteral extends Node, BaseExpression {
    type: 'Literal';
    value: SimpleLiteralValue;
    raw: string;
  }

  export interface RegExpLiteral extends Node, BaseExpression {
    type: 'Literal';
    value: RegExp;
    regex: {
      pattern: string;
      flags: string;
    };
    raw: string;
  }

  export interface ForOfStatement extends BaseForXStatement {
    type: 'ForOfStatement';
  }

  export interface Super extends Node {
    type: 'Super';
  }

  export interface SpreadElement extends Node {
    type: 'SpreadElement';
    argument: Expression;
  }

  export interface ArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: 'ArrowFunctionExpression';
    expression: boolean;
    body: BlockStatement | Expression;
  }

  export interface YieldExpression extends BaseExpression {
    type: 'YieldExpression';
    argument?: Expression;
    delegate: boolean;
  }

  export interface TemplateLiteral extends BaseExpression {
    type: 'TemplateLiteral';
    quasis: Array<TemplateElement>;
    expressions: Array<Expression>;
  }

  export interface TaggedTemplateExpression extends BaseExpression {
    type: 'TaggedTemplateExpression';
    tag: Expression;
    quasi: TemplateLiteral;
  }

  export interface TemplateElement extends Node {
    type: 'TemplateElement';
    tail: boolean;
    value: {
      cooked: string;
      raw: string;
    };
  }

  export interface AssignmentProperty extends Property {
    value: Pattern;
    kind: 'init';
    method: boolean; // false
  }

  export interface ObjectPattern extends BasePattern {
    type: 'ObjectPattern';
    properties: Array<AssignmentProperty>;
  }

  export interface ArrayPattern extends BasePattern {
    type: 'ArrayPattern';
    elements: Array<Pattern>;
  }

  export interface RestElement extends BasePattern {
    type: 'RestElement';
    argument: Pattern;
  }

  export interface AssignmentPattern extends BasePattern {
    type: 'AssignmentPattern';
    left: Pattern;
    right: Expression;
  }

  export interface ClassBody extends Node {
    type: 'ClassBody';
    body: Array<ClassBodyElement>;
  }

  export interface MethodDefinition extends Node {
    type: 'MethodDefinition';
    key: Expression;
    value: FunctionExpression;
    kind: MethodKind;
    computed: boolean;
    static: boolean;
  }

  export interface ClassDeclaration extends BaseClass, BaseDeclaration {
    type: 'ClassDeclaration';
    id: Identifier;
  }

  export interface ClassExpression extends BaseClass, BaseExpression {
    type: 'ClassExpression';
    id?: Identifier;
  }

  export interface MetaProperty extends BaseExpression {
    type: 'MetaProperty';
    meta: Identifier;
    property: Identifier;
  }

  export interface ImportDeclaration extends BaseModuleDeclaration {
    type: 'ImportDeclaration';
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    source: Literal;
  }

  export interface ImportSpecifier extends BaseModuleSpecifier {
    type: 'ImportSpecifier';
    imported: Identifier;
  }

  export interface ImportDefaultSpecifier extends BaseModuleSpecifier {
    type: 'ImportDefaultSpecifier';
  }

  export interface ImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: 'ImportNamespaceSpecifier';
  }

  export interface ExportNamedDeclaration extends BaseModuleDeclaration {
    type: 'ExportNamedDeclaration';
    declaration?: Declaration;
    specifiers: Array<ExportSpecifier>;
    source?: Literal;
  }

  export interface ExportSpecifier extends BaseModuleSpecifier {
    type: 'ExportSpecifier';
    exported: Identifier;
  }

  export interface ExportDefaultDeclaration extends BaseModuleDeclaration {
    type: 'ExportDefaultDeclaration';
    declaration: Declaration | Expression;
  }

  export interface ExportAllDeclaration extends BaseModuleDeclaration {
    type: 'ExportAllDeclaration';
    source: Literal;
  }

  export interface AwaitExpression extends BaseExpression {
    type: 'AwaitExpression';
    argument: Expression;
  }

  export interface ClassProperty extends Node {
    type: 'ClassProperty';
    key: Literal | Identifier | Expression;
    computed: boolean;
  }

  export interface ClassPropertyDefinition extends Node {
    type: 'ClassProperty';
    definition: ClassBodyElement;
  }

  export interface ObjectExpression extends BaseExpression {
    type: 'ObjectExpression';
    properties: ObjectExpressionProperty[];
  }

  export interface Decorator {
    type: 'Decorator';
    expression: Expression;
  }

  export interface ObjectMethod {
    type: 'ObjectMethod';
    kind: ObjectMethodKind;
    key: Literal | Identifier | Expression;
    params: Pattern[];
    body: BlockStatement;
    computed: boolean;
    generator: boolean;
    async: boolean;
    decorators: Decorator[];
  }

  export interface ObjectProperty {
    type: 'ObjectProperty';
    key: Literal | Identifier | Expression;
    value: Expression | Pattern;
    computed: boolean;
  }

  export interface SpreadProperty {
    type: 'SpreadProperty';
    argument: Expression;
  }

  /* ---------------------------------------------------------------------------
   * ast-types API
   */

  type ConvertibleToType = (Type | Def | Node | Array<Type | Def | Node>);

  export function defineMethod(name: string, func: Function): Function;
  export function getFieldNames(object: Node): string[];
  export function getFieldValue(object: Node, fieldName: string): any;
  export function eachField(object: Node, callback: (name: string, value: any) => void, context?: Object): void;
  export function someField(object: Node, callback: (name: string, value: any) => void, context?: Object): string[];
  export function getSupertypeNames(typeName: string): string;
  export function astNodesAreEquivalent(): void;
  export function finalize(): void;
  export function use(plugin: any): any;
  export function visit(node: Node | NodePath, methods: Object): void; // TODO: return PathVisitor

  export class Type {
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

  export class Field {
    constructor(name: string, type: ConvertibleToType, defaultFn: Function, hidden?: boolean);
    toString(): string;
    getValue(obj: Node): any;
  }

  export class Def {
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

  export class Path {
    value: Node;
    parentPath: NodePath;
    name: string;

    constructor(value: Node, parentPath?: Path, name?: string);
    getValueProperty(name: string): string;
    get(name: string): this;
    each(callback: (childPath: NodePath) => void, context?: Path): void;
    map(callback: (childPath: NodePath) => NodePath, context?: Path): NodePath[];
    filter(callback: (childPath: NodePath) => boolean, context?: Path): NodePath[];
    shift(): void;
    unshift(...nodes: Node[]): void;
    push(...nodes: Node[]): void;
    pop(): Node;
    insertAt(index: number, node: Node): Path;
    insertBefore(node: Node): Path;
    insertAfter(node: Node): Path;
    replace(replacement: Node): Path[];
  }

  export class NodePath extends Path {
    node: Node;
    parent: NodePath;
    scope: Scope;

    constructor(value: Node, parentPath?: Path, name?: string);

    prune(): NodePath;
    getValueProperty(name: string): any;
    needsParens(assumeExpressionContext: boolean): boolean;
    canBeFirstInStatement(): boolean;
    firstInStatement(): boolean;
  }

  export class Scope {
    declares(name: string): boolean;
    declaresType(name: string): boolean;
    declareTemporary(name: string): Identifier;
    injectTemporary(identifier: string, init: any): Identifier;
    scan(force: boolean): void;
    getBindings(): Object;
    getTypes(): Object;
    lookup(name: string): Scope;
    lookupType(name: string): Scope;
    getGlobalScope(): Scope;

    path: NodePath;
    node: Node;
    isGlobal: boolean;
    depth: number;
    parent: NodePath;
    bindings: any; // TODO
    type: any; // TODO
  }

  export var builtInTypes: {
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

  export var namedTypes: {
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
    booleanTypeAnnotation: Type,
    booleanLiteralTypeAnnotation: Type,
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
    booleanLiteral: Type,
    RegExpLiteral: Type,
    ObjectMethod: Type,
    ObjectProperty: Type,
    ClassMethod: Type,
    RestProperty: Type,
    ForAwaitStatement: Type,
    [typeName: string]: Type
  };

  export var builders: {
    program: (statements: Node[]) => Program;
    jsxElement: (
      openingElement: JSXOpeningElement,
      closingElement: JSXClosingElement,
      children: (Literal | JSXExpressionContainer | JSXElement)[]
    ) => JSXElement,
    jsxClosingElement: (
      name: JSXIdentifier
    ) => JSXClosingElement,
    jsxOpeningElement: (
      name: JSXIdentifier,
      attributes: JSXAttribute[],
      selfClosing: boolean
    ) => JSXOpeningElement,
    jsxAttribute: (
      name: JSXIdentifier,
      value: Literal | JSXExpressionContainer
    ) => JSXAttribute,
    jsxExpressionContainer: (
      expression: Expression
    ) => JSXExpressionContainer;
    jsxIdentifier: (
      name: string
    ) => JSXIdentifier;
    ifStatement: (
      test: Expression,
      consequent: Statement,
      alternate?: Statement
    ) => IfStatement,
    unaryExpression: (
      operator: UnaryOperator,
      arguement: Expression
    ) => UnaryExpression,
    importDeclaration: (
      specifiers: Node[],
      source: Literal
    ) => ImportDeclaration;
    importSpecifier: (
      imported: Identifier,
      local: Identifier
    ) => ImportSpecifier;
    arrayExpression: (
      elements: ArrayExpressionElements
    ) => ArrayExpression,
    binaryExpression: (
      operator: string,
      left: Expression,
      right: Expression
    ) => BinaryExpression;
    arrowFunctionExpression: (
      params: Pattern[],
      body: BlockStatement | Expression,
      expression?: boolean
    ) => ArrowFunctionExpression;
    assignmentExpression: (
      operator: string, left: Pattern, right: Expression
    ) => AssignmentExpression,
    blockStatement: (
      body: Statement[]
    ) => BlockStatement,
    callExpression: (
      callee: Expression | Super,
      args: Expression[]
    ) => CallExpression,
    classBody: (
      body: ClassBodyElement[]
    ) => ClassBody,
    classDeclaration: (
      id: Identifier,
      body: ClassBody,
      superClass?: Expression
    ) => ClassDeclaration,
    expressionStatement: (
      expression: Expression
    ) => ExpressionStatement,
    functionDeclaration: (
      id: Identifier,
      params: Pattern[],
      body: (BlockStatement | Expression)
    ) => FunctionDeclaration,
    functionExpression: (
      id: Identifier, params: Pattern[],
      body: (BlockStatement | Expression)
    ) => FunctionExpression,
    literal: (
      value: (String | boolean | Number | RegExp),
      regex?: any
    ) => Literal,
    memberExpression: (
      object: Expression,
      property: (Identifier | Expression),
      computed?: boolean
    ) => MemberExpression,
    methodDefinition: (
      kind: MethodKind,
      key: (Literal | Identifier | Expression),
      value: Function, static?: boolean
    ) => MethodDefinition,
    newExpression: (
      callee: Expression,
      args: (Expression | SpreadElement)[]
    ) => NewExpression,
    objectExpression: (
      properties: (Property | ObjectMethod | ObjectProperty | SpreadProperty)[]
    ) => ObjectExpression,
    property: (
      kind: PropertyKind,
      key: (Literal | Identifier | Expression),
      value: (Expression | Pattern)) => Property;
    identifier: (
      name: string
    ) => Identifier,
    returnStatement: (
      argument: Expression
    ) => ReturnStatement,
    super: (
    ) => Super,
    thisExpression: (
    ) => ThisExpression,
    variableDeclaration: (
    kind: VariableKind,
      declarations: VariableDeclarator[]
    ) => VariableDeclaration,
    variableDeclarator: (
      id: Pattern,
      init: Expression
    ) => VariableDeclarator,
    [name: string]: (...args: Array<any>) => Node
  };

}

export declare namespace recast {
  function parse(code: string, args?: Object): ast.Node;
  function visit(node: ast.Node | ast.NodePath, methods: Object): void;
  function print(node: ast.Node): { code: string };
}
