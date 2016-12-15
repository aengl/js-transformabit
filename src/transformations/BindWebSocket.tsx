import { Transformation } from '../Transformation';
import { GenericJsNode, JsNodeList } from '../JsNode';
import { Project } from '../Project';
import {
  JsCode,
  MethodDefinition,
  MemberExpression,
  ExpressionStatement,
  AssignmentExpression,
  NewExpression,
  Literal,
  AssignmentOperator,
  Identifier,
  ClassDeclaration,
  BlockStatement,
  MethodKind,
  ReactClassComponent
} from '../JsCode';

export class BindWebSocket implements Transformation {
  component: string;
  address: string;

  configure(args: any[]): void {
    this.component = args[0];
    this.address = args[1];
  }

  check(root: GenericJsNode, project: Project): boolean {
    return this.getMatchingReactComponents(root).size() > 0;
  }

  private getMatchingReactComponents(root: GenericJsNode) {
    return root.findChildrenOfType(ClassDeclaration, null, true)
      .filter(k => k.id().name === this.component && ReactClassComponent.check(k));
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    const component = this.getMatchingReactComponents(root).first();
    this.addBindings(component.findConstructor());
    return root;
  }

  private addBindings(ctor: GenericJsNode) {
    const onMessage = (
      <MethodDefinition key={"onMessage"} kind={MethodKind.Method}>
      </MethodDefinition>
    ) as MethodDefinition;

    const onOpen = (
      <MethodDefinition key={"onOpen"} kind={MethodKind.Method}>
      </MethodDefinition>
    ) as MethodDefinition;

    const onError = (
      <MethodDefinition key={"onError"} kind={MethodKind.Method}>
      </MethodDefinition>
    ) as MethodDefinition;

    ctor.path.insertAfter(onMessage.node);
    ctor.path.insertAfter(onOpen.node);
    ctor.path.insertAfter(onError.node);

    ctor.findChildrenOfType(BlockStatement).forEach(bs => {
      let socketObject = (<MemberExpression object="this" property="connection" />) as MemberExpression;
      let newWebsocket = (
        <NewExpression callee={new Identifier({ name: "WebSocket" })}>
          <Literal value={"wss://" + this.address} />
        </NewExpression>
      ) as NewExpression;
      let socketCall = (
        <ExpressionStatement>
          <AssignmentExpression
            operator={AssignmentOperator.Equals}
            left={socketObject}
            right={newWebsocket}
            />
        </ExpressionStatement>
      ) as ExpressionStatement;
      bs.node.body.push(socketCall.node);
    });
  }
}
