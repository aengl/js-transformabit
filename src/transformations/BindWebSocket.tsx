import {Transformation} from '../Transformation';
import {GenericJsNode} from '../JsNode';
import {Project} from '../Project';
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
    MethodKind
} from '../JsCode';

export class BindWebSocket implements Transformation {

    component: string;
    address: string;

    configure(args: any[]): void {
        this.component = args[0];
        this.address = args[1];
    }

    check(root: GenericJsNode, project: Project): boolean {
        return this.getMatchingReactComponents(root).length > 0;
    }

    private getMatchingReactComponents(root: GenericJsNode): GenericJsNode[] {
        const matchingComponents = root.findChildrenOfType(ClassDeclaration)
            .filter(k => this.isMatchingComponentName(k) && this.isReactComponent(k));
        return matchingComponents.toArray();
    }

    private isMatchingComponentName(klass: ClassDeclaration): boolean {
        return klass.node.id.name === this.component;
    }

    private isReactComponent(klass: ClassDeclaration): boolean {
        return klass.superClass().format() === 'React.Component';
    }

    apply(root: GenericJsNode, project: Project): GenericJsNode {
        const component = this.getMatchingReactComponents(root)[0];
        component.findChildrenOfType(MethodDefinition).forEach(m => {
           if (m.node.kind === "constructor") {
               this.addBindings(m);
           }
        });
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
            let socketObject =  (<MemberExpression object="this" property="connection"/>) as MemberExpression;
            let newWebsocket = (
                <NewExpression callee={new Identifier({name: "WebSocket"})}>
                    <Literal value={"wss://" + this.address}/>
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