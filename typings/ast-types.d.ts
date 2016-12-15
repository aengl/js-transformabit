/**
 * Type declarations for ast-types.
 *
 * https://github.com/benjamn/ast-types
 *
 * A large part of this file is taken from the estree type definitions:
 * https://github.com/DefinitelyTyped/DefinitelyTyped
 */

// TODO: publish using
// https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html

interface BaseNode {
  // Every leaf interface that extends BaseNode must specify a type property.
  // The type property should be a string literal. For example, Identifier
  // has: `type: 'Identifier'`

  leadingComments?: Array<Comment>;
  trailingComments?: Array<Comment>;
  loc?: SourceLocation;
  range?: [number, number];
}

export type Node =
  Identifier | Literal | Program | Function | SwitchCase | CatchClause |
  File | VariableDeclarator | Statement | Expression | Property |
  AssignmentProperty | Super | TemplateElement | SpreadElement | Pattern |
  ClassBody | Class | MethodDefinition | ModuleDeclaration | ModuleSpecifier;

export interface Comment {
  value: string;
}

interface SourceLocation {
  source?: string;
  start: Position;
  end: Position;
}

export interface Position {
  /** >= 1 */
  line: number;
  /** >= 0 */
  column: number;
}

export interface File {
  type: 'File';
  program: Program;
  loc?: SourceLocation;
  comments?: any; // No idea what that is for
}

export interface Program extends BaseNode {
  type: 'Program';
  sourceType: 'script' | 'module';
  body: Array<Statement | ModuleDeclaration>;
}

interface BaseFunction extends BaseNode {
  params: Array<Pattern>;
  generator?: boolean;
  async?: boolean;
  // The body is either BlockStatement or Expression because arrow functions
  // can have a body that's either. FunctionDeclarations and
  // FunctionExpressions have only BlockStatement bodies.
  body: BlockStatement | Expression;
}

export type Function =
  FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;


export type Statement =
  ExpressionStatement | BlockStatement | EmptyStatement |
  DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement |
  BreakStatement | ContinueStatement | IfStatement | SwitchStatement |
  ThrowStatement | TryStatement | WhileStatement | DoWhileStatement |
  ForStatement | ForInStatement | ForOfStatement | Declaration;
interface BaseStatement extends BaseNode { }

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

interface BaseForXStatement extends BaseStatement {
  left: VariableDeclaration | Expression;
  right: Expression;
  body: Statement;
}

export interface ForInStatement extends BaseForXStatement {
  type: 'ForInStatement';
}

export interface DebuggerStatement extends BaseStatement {
  type: 'DebuggerStatement';
}

export type Declaration =
  FunctionDeclaration | VariableDeclaration | ClassDeclaration;
interface BaseDeclaration extends BaseStatement { }

export interface FunctionDeclaration extends BaseFunction, BaseDeclaration {
  type: 'FunctionDeclaration';
  id: Identifier;
  body: BlockStatement;
}

export interface VariableDeclaration extends BaseDeclaration {
  type: 'VariableDeclaration';
  declarations: Array<VariableDeclarator>;
  kind: 'var' | 'let' | 'const';
}

export interface VariableDeclarator extends BaseNode {
  type: 'VariableDeclarator';
  id: Pattern;
  init?: Expression;
}

type Expression =
  ThisExpression | ArrayExpression | ObjectExpression | FunctionExpression |
  ArrowFunctionExpression | YieldExpression | Literal | UnaryExpression |
  UpdateExpression | BinaryExpression | AssignmentExpression |
  LogicalExpression | MemberExpression | ConditionalExpression |
  CallExpression | NewExpression | SequenceExpression | TemplateLiteral |
  TaggedTemplateExpression | ClassExpression | MetaProperty | Identifier |
  AwaitExpression;

export interface BaseExpression extends BaseNode { }

export interface ThisExpression extends BaseExpression {
  type: 'ThisExpression';
}

export interface ArrayExpression extends BaseExpression {
  type: 'ArrayExpression';
  elements: Array<Expression | SpreadElement>;
}

export interface Property extends BaseNode {
  type: 'Property';
  key: Expression;
  value: Expression | Pattern; // Could be an AssignmentProperty
  kind: 'init' | 'get' | 'set';
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

interface BaseCallExpression extends BaseExpression {
  callee: Expression | Super;
  arguments: Array<Expression | SpreadElement>;
}
export type CallExpression = SimpleCallExpression | NewExpression;

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

export type Pattern =
  Identifier | ObjectPattern | ArrayPattern | RestElement |
  AssignmentPattern | MemberExpression;
interface BasePattern extends BaseNode { }

export interface SwitchCase extends BaseNode {
  type: 'SwitchCase';
  test?: Expression;
  consequent: Array<Statement>;
}

export interface CatchClause extends BaseNode {
  type: 'CatchClause';
  param: Pattern;
  body: BlockStatement;
}

export interface Identifier extends BaseNode, BaseExpression, BasePattern {
  type: 'Identifier';
  name: string;
}

export type Literal = SimpleLiteral | RegExpLiteral;

export interface SimpleLiteral extends BaseNode, BaseExpression {
  type: 'Literal';
  value: string | boolean | number | null;
  raw: string;
}

export interface RegExpLiteral extends BaseNode, BaseExpression {
  type: 'Literal';
  value: RegExp;
  regex: {
    pattern: string;
    flags: string;
  };
  raw: string;
}

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

export interface ForOfStatement extends BaseForXStatement {
  type: 'ForOfStatement';
}

export interface Super extends BaseNode {
  type: 'Super';
}

export interface SpreadElement extends BaseNode {
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

export interface TemplateElement extends BaseNode {
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

export type Class = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
  superClass?: Expression;
  body: ClassBody;
}

export interface ClassBody extends BaseNode {
  type: 'ClassBody';
  body: Array<MethodDefinition>;
}

export interface MethodDefinition extends BaseNode {
  type: 'MethodDefinition';
  key: Expression;
  value: FunctionExpression;
  kind: 'constructor' | 'method' | 'get' | 'set';
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

export type ModuleDeclaration =
  ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration |
  ExportAllDeclaration;
interface BaseModuleDeclaration extends BaseNode { }

export type ModuleSpecifier =
  ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier |
  ExportSpecifier;
interface BaseModuleSpecifier extends BaseNode {
  local: Identifier;
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

export interface ClassProperty extends BaseNode {
  type: 'ClassProperty';
  key: Literal | Identifier | Expression;
  computed: boolean;
}

type ClassBodyElement =
  MethodDefinition | VariableDeclarator | ClassPropertyDefinition | ClassProperty;

export interface ClassPropertyDefinition extends BaseNode {
  type: 'ClassProperty';
  definition: ClassBodyElement;
}

type ObjectExpressionProperty =
  Property | ObjectMethod | ObjectProperty | SpreadProperty;

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
  kind: 'method' | 'get' | 'set';
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
  parentPath: Path;
  name: string;

  constructor(value: Path, parentPath?: Path, name?: string);
  getValueProperty(name: string): string;
  get(name: string): any;
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

export class NodePath extends Path {
  node: Node;
  parent: NodePath;
  scope: Scope;

  constructor(value: Path, parentPath?: Path, name?: string);

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
    callee: Expression,
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
    kind: ('constructor' | 'method' | 'get' | 'set'),
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
    kind: ('init' | 'get' | 'set'),
    key: (Literal | Identifier | Expression),
    value: (Expression | Pattern)) => Property;
  identifier: (
    name: string
  ) => Identifier,
  returnStatement: (
    argument: Expression
  ) => ReturnStatement,
  thisExpression: (
  ) => ThisExpression,
  variableDeclaration: (
    kind: string,
    declarations: VariableDeclarator[]
  ) => VariableDeclaration,
  variableDeclarator: (
    id: Pattern,
    init: Expression
  ) => VariableDeclarator,
  [name: string]: (...args: Array<any>) => Node
};
