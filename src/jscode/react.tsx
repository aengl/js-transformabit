import { JsNode, JsNodeType, GenericJsNode } from '../JsNode';
import { JsCode } from '../JsCode';
import * as js from './js';
import { ast } from '../../deps/bundle';

const b = ast.builders;

export type AnyReactComponent = (
  ReactStatelessComponent |
  ReactComponent |
  ReactClassComponent
);

export type StatefulReactComponent = (
  ReactComponent |
  ReactClassComponent
);

function find(children: GenericJsNode[], type: JsNodeType<any>): GenericJsNode {
  for (let child of children) {
    if (child instanceof type) {
      return child;
    }
  }
  return null;
}

function getRenderBodyFromChildren(children: GenericJsNode[]): ast.Expression {
  const body = find(children, ReactComponentRender);
  if (body) {
    return body.node as ast.Expression;
  }
  return null;
}

function getEventHandlersFromChildren(children: GenericJsNode[]): ReactComponentEventHandler[] {
  return children.filter(child =>
    child instanceof ReactComponentEventHandler) as ReactComponentEventHandler[];
}

/** ----------------------------------------------------------------------------
 * Stateless Component
 */

export type ReactStatelessComponentProps = {
  name: string;
};

export class ReactStatelessComponent
  extends js.VariableDeclaration<ast.VariableDeclaration, ReactStatelessComponentProps> {

  static check(node: GenericJsNode): boolean {
    if (node instanceof js.VariableDeclaration) {
      const callExp = node.findFirstChildOfType(js.CallExpression);
      if (callExp) {
        return callExp.callee().format() === 'React.createClass';
      }
    }
    return false;
  }

  get name(): string {
    return this.declarations().first().name;
  }

  set name(value: string) {
    this.declarations().first().name = value;
  }

  build(props: ReactStatelessComponentProps,
    children: GenericJsNode[]): this {

    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.arrowFunctionExpression(
          [b.identifier('props')],
          getRenderBodyFromChildren(children)
        )
      )
    ]);
    return this;
  }
}

/** ----------------------------------------------------------------------------
 * Component (React.createClass(...))
 */

export type ReactComponentProps = {
  name: string;
};

export class ReactComponent
  extends js.VariableDeclaration<ast.VariableDeclaration, ReactComponentProps> {

  static check(node: GenericJsNode): boolean {
    if (node instanceof js.VariableDeclaration) {
      const callExp = node.findFirstChildOfType(js.CallExpression);
      if (callExp) {
        return callExp.callee().format() === 'React.createClass';
      }
    }
    return false;
  }

  get name(): string {
    return this.declarations().first().name;
  }

  set name(value: string) {
    this.declarations().first().name = value;
  }

  build(props: ReactComponentProps, children: GenericJsNode[]): this {
    // Create event handlers
    const eventHandlers = getEventHandlersFromChildren(children)
      .map(handler => b.property(
        'init',
        b.identifier(handler.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
    );
    eventHandlers.forEach(handler => handler.method = true);
    // Create render method
    const renderMethod = b.property('init', b.identifier('render'),
      b.functionExpression(null, [], b.blockStatement([
        b.returnStatement(getRenderBodyFromChildren(children))
      ]))
    );
    renderMethod.method = true;
    // Create AST
    this.node = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(props.name),
        b.callExpression(
          b.memberExpression(b.identifier('React'), b.identifier('createClass')),
          [b.objectExpression([renderMethod].concat(eventHandlers))]
        )
      )
    ]);
    return this;
  }

  findConstructor(): js.MethodDefinition {
    throw 'TODO';
    // return this
    //   .findChildrenOfType(js.MethodDefinition, m => m.kind === 'constructor')
    //   .first();
  }

  createConstructor(): this {
    throw 'TODO';
    /* Relevant code from AddWebSocket editor
    private hasInit(body: js.BlockStatement, params: AddWebSocketParams): boolean {
      return body.findChildrenOfType(js.AssignmentExpression).filter(exp => {
        const left = exp.left();
        if (left.check(js.MemberExpression)) {
          if (left.object.name !== "this" || left.property.name !== "connection") {
            return false;
          }
        } else {
          return false;
        }
        const right = exp.right();
        if (right.check(js.NewExpression)) {
          this.project.println(right.callee().children().at(0).format());
        } else {
          return false;
        }

        return false;
      }).size() > 0;
    }
    */
  }

  findMethod(name: string) {
    throw 'TODO';
  }

  addMethod(method: js.MethodDefinition) {
    throw 'TODO';
  }

  convertToReactClassComponent() {
    const methods = this
      .findFirstChildOfType(js.ObjectExpression)
      .children<js.Property>()
      .map(prop => b.methodDefinition(
        'method',
        b.identifier(prop.key().name),
        b.functionExpression(
          null,
          prop.findFirstChildOfType(js.FunctionExpression).params().nodes<ast.Pattern>(),
          prop.findFirstChildOfType(js.BlockStatement).node
        )
      ));
    const className = this.declarations().first().id().name;
    this.replace(
      b.classDeclaration(
        b.identifier(className),
        b.classBody(methods),
        b.memberExpression(
          b.identifier('React'),
          b.identifier('Component')
        )
      )
    );
    return this.castTo(ReactClassComponent);
  }
}

/** ----------------------------------------------------------------------------
 * Class Component
 */

export type ReactClassComponentProps = js.ClassDeclarationProps;

export class ReactClassComponent
  extends js.ClassDeclaration<ast.ClassDeclaration, ReactClassComponentProps> {

  static check(node: GenericJsNode): boolean {
    return (node instanceof js.ClassDeclaration) && (
      node.superClass().format() === 'React.Component' ||
      node.superClass().format() === 'Component'
    );
  }

  build(props: ReactClassComponentProps, children: GenericJsNode[]): this {
    // Create event handlers
    let eventHandlers = getEventHandlersFromChildren(children)
      .map(handler => b.methodDefinition(
        'method',
        b.identifier(handler.name),
        b.functionExpression(null, [b.identifier('event')], handler.node)
      )
      );
    // Create AST
    this.node = b.classDeclaration(
      b.identifier(typeof props.id === 'string' ? props.id : props.id.name),
      b.classBody([
        b.methodDefinition(
          'method',
          b.identifier('render'),
          b.functionExpression(
            null,
            [],
            b.blockStatement([
              b.returnStatement(getRenderBodyFromChildren(children))
            ])
          )
        )
      ].concat(eventHandlers)),
      b.memberExpression(
        b.identifier('React'),
        b.identifier('Component')
      )
    );
    return this;
  }

  getRenderMethod() {
    const methods = this
      .findChildrenOfType(js.MethodDefinition)
      .filter(node => node.methodName() === 'render');
    if (methods.size() > 0) {
      return methods.at(0);
    }
  }

  addMethod(method: js.MethodDefinition, bind: boolean = true) {
    super.addMethod(method);
    if (bind) {
      const methodName = method.methodName();
      if (methodName) {
        // Not all methods have a name since they can be expressions. We will
        // only bind if we can determine a name.
        this.bindThisToMethod(methodName);
      }
    }
  }

  bindThisToMethod(methodName: string) {
    // First, let's make sure we have a constructor
    const body = this.findOrCreate(this.findConstructor, this.createConstructor).body();
    if (!(body instanceof js.BlockStatement)) {
      throw new Error('Constructor must have BlockStatement as its body');
    }
    // Next, add a bind expression to the constructor body
    body.append(
      <js.ExpressionStatement>
        <js.AssignmentExpression>
          <js.MemberExpression object='this' property={methodName} />
          <js.CallExpression callee={(
            <js.MemberExpression>
              <js.MemberExpression>
                <js.ThisExpression />
                <js.Identifier name={methodName} />
              </js.MemberExpression>
              <js.Identifier name='bind' />
            </js.MemberExpression> as js.MemberExpression
          )}>
            <js.ThisExpression />
          </js.CallExpression>
        </js.AssignmentExpression>
      </js.ExpressionStatement> as js.ExpressionStatement
    );
  }

  convertToReactComponent() {
    let methods = this.findChildrenOfType(js.MethodDefinition, node => node.kind === 'method');
    let properties: ast.Property[] = methods.map(method =>
      b.property('init', b.identifier(method.methodName()),
        b.functionExpression(
          null,
          method.methodArgs().map(m => m.node),
          method.body().node as ast.BlockStatement
        )
      )
    );
    properties.forEach(property => property.method = true);
    this.replace(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          b.identifier(this.id().name),
          b.callExpression(
            b.memberExpression(b.identifier('React'), b.identifier('createClass')),
            [b.objectExpression(properties)]
          )
        )
      ])
    );
    return this.castTo(ReactComponent);
  }
}

/** ----------------------------------------------------------------------------
 * Render Function
 */

export class ReactComponentRenderProps {
}

export class ReactComponentRender extends JsNode<any, ReactComponentRenderProps> {
  static check(node: GenericJsNode): boolean {
    return node instanceof js.MethodDefinition && node.methodName() === 'render';
  }

  build(props: ReactComponentRenderProps, children: string[]): this {
    if (children.length !== 1) {
      throw new Error('ReactComponentRender requires exactly one child');
    }
    const renderBody = children[0];
    if (typeof renderBody !== 'string') {
      throw new Error('ReactComponentRender only accepts strings as children');
    }
    this.node = JsNode.fromExpressionStatement(renderBody).node;
    return this;
  }
}

/** ----------------------------------------------------------------------------
 * Event Handler
 */

export class ReactComponentEventHandlerProps {
  name: string;
}

export class ReactComponentEventHandler
  extends js.BlockStatement<any, ReactComponentEventHandlerProps> {

  name: string;

  static check(node: GenericJsNode): boolean {
    return node instanceof js.MethodDefinition
      && node.kind === 'method'
      && node.methodName() !== 'render';
  }

  build(props: ReactComponentEventHandlerProps,
    children: js.GenericStatement[]): this {

    this.name = props.name;
    this.node = b.blockStatement(children.map(child => child.node));
    return this;
  }
}
