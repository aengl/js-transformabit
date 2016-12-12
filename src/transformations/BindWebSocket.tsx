import {Transformation} from '../Transformation';
import {GenericJsNode, JsNode, NamedTypes as t} from '../JsNode';
import {Project} from '../Project';
import {ClassDeclaration, Identifier, MemberExpression, MethodDefinition, CallExpression, BlockStatement}  from 'ast-types';
import { 
    MethodDefinition as MethodDefinitionCode, 
    MethodKind, CallExpression as CallExpressionCode, 
    MemberExpression as MemberExpressionCode,
    ExpressionStatement as ExpressionStatementCode,
    VariableDeclaration as VariableDeclarationCode,
    AssignmentExpression as AssignmentExpressionCode,
    NewExpression as NewExpressionCode,
    Literal as LiteralCode,
    AssignmentOperator,
    VariableKind,
    Identifier as IdentifierCode,
    JsCode
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
       const matchingComponents = root.findChildrenOfType(t.ClassDeclaration).filter(k => {
            const klass  = k.node() as ClassDeclaration;
            if (!this.isMatchingComponentName(klass)) {
                return false;
            }

            if (!this.isReactComponent(klass)) {
                return false;
            }
            return true;
        });
        return matchingComponents.toArray();
    }

    private isMatchingComponentName(klass: ClassDeclaration): boolean {
        return ((klass.id as Identifier).name == this.component);
    }

    private isReactComponent(klass: ClassDeclaration): boolean {
        if (klass.superClass.type !== "MemberExpression") {
            return false;
        }
        const member = (klass.superClass as MemberExpression);
        if ((member.object as Identifier).name !== "React") {
            return false;
        }
        if ((member.property as Identifier).name !== "Component") {
            return false;
        }
        return true;
    }

    apply(root: GenericJsNode, project: Project): GenericJsNode {
        const component = this.getMatchingReactComponents(root)[0];
        component.findChildrenOfType(t.MethodDefinition).forEach(m => {
           const method = m.node() as MethodDefinition; 
           if (method.kind === "constructor") {
               this.addBindings(m);
           }
        });
        
        return root;
    }

    private addBindings(ctor: GenericJsNode) {
        const onMessage = (
            <MethodDefinitionCode key={"onMessage"} kind={MethodKind.Method}>
            </MethodDefinitionCode>
        ) as MethodDefinitionCode;

        const onOpen = (
            <MethodDefinitionCode key={"onOpen"} kind={MethodKind.Method}>
            </MethodDefinitionCode>
        ) as MethodDefinitionCode;

        const onError = (
            <MethodDefinitionCode key={"onError"} kind={MethodKind.Method}>
            </MethodDefinitionCode>
        ) as MethodDefinitionCode; 

        ctor.path().insertAfter(onMessage.node());
        ctor.path().insertAfter(onOpen.node());
        ctor.path().insertAfter(onError.node());

        ctor.findChildrenOfType(t.BlockStatement).forEach(bs => {
            const blockStatement = bs.node() as BlockStatement;
            let socketObject =  (<MemberExpressionCode object="this" property="connection"/>) as MemberExpressionCode;
            let newWebsocket = (
                <NewExpressionCode callee={new IdentifierCode({name: "WebSocket"})}>
                    <LiteralCode value={"wss://" + this.address}/>
                </NewExpressionCode>
            ) as NewExpressionCode;
            let socketCall = (
                <ExpressionStatementCode>
                    <AssignmentExpressionCode
                        operator={AssignmentOperator.Equals}
                        left={socketObject}
                        right={newWebsocket}
                    />
                </ExpressionStatementCode>
            ) as ExpressionStatementCode;
            blockStatement.body.push(socketCall.node());
        });
    }


}