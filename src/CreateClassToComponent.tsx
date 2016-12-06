import {Transformation} from './Transformation';
import {GenericJsNode, JsNode, NamedTypes as t} from './JsNode';
import {CallExpression, MemberExpression, Identifier, VariableDeclaration, VariableDeclarator, Node}  from 'ast-types';
import {Project} from './Project';
import {ClassDeclaration, MemberExpression as MemberExpressionCode, Identifier as IdentifierCode, JsCode} from './JsCode';


export class CreateClassToComponent implements Transformation {

  configure(args: any[]): void {

  }

  check(root: GenericJsNode, project: Project): boolean {
    const createClasses = root.findChildrenOfType(t.CallExpression).filter<CallExpression>(ce => {
      if (((ce.getNode().callee as MemberExpression).object as Identifier).name === "React") {
        return ((ce.getNode().callee as MemberExpression).property as Identifier).name === "createClass";
      }
    });
    return createClasses.length > 0;
  }


  apply(root: GenericJsNode, project: Project): GenericJsNode {
    const variableDeclrations = root.findChildrenOfType(t.VariableDeclaration).forEach<VariableDeclaration>(vd => {
      if (vd.getNode().declarations[0].init.type == "CallExpression") {
        const ce = vd.getNode().declarations[0].init as CallExpression;
        if (((ce.callee as MemberExpression).object as Identifier).name === "React") {
          if (((ce.callee as MemberExpression).property as Identifier).name === "createClass") {
            vd.replace(this.createComponent(vd));
          }
        }
      }
    });
    return root;
  }

  createComponent(varDec: JsNode<VariableDeclaration>): GenericJsNode {
    const reactComponent = <MemberExpressionCode object="React" property="Componenent"/> as MemberExpressionCode
    let component = <ClassDeclaration id={(((varDec.getNode().declarations[0]) as VariableDeclarator).id as Identifier).name} superClass={reactComponent}></ClassDeclaration> as ClassDeclaration
    return component;
  }
}
