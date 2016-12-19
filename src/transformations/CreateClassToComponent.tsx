import {Transformation} from '../Transformation';
import {GenericJsNode, JsNode} from '../JsNode';
import {
  CallExpression,
  ObjectExpression,
  MemberExpression,
  Identifier,
  VariableDeclaration,
  VariableDeclarator,
  Property
} from 'ast-types';
import {Project} from '../Project';
import {
  JsCode,
  ClassDeclaration,
  MethodDefinition,
  MemberExpression as MemberExpressionCode,
  CallExpression as CallExpressionCode,
  VariableDeclaration as VariableDeclarationCode
} from '../JsCode';

export class CreateClassToComponent implements Transformation {

  configure(args: any[]): void {

  }

  check(root: GenericJsNode, project: Project): boolean {
    const createClasses = root.findChildrenOfType(CallExpressionCode).filter(ce => {
      const callExpression = ce.node as CallExpression;
      const callee = callExpression.callee as MemberExpression;
      if (typeof (callee.object as Identifier) === "undefined") {
        return false;
      }
      if ((callee.object as Identifier).name === "React") {
        return (callee.property as Identifier).name === "createClass";
      }
    });
    return createClasses.size() > 0;
  }


  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root.findChildrenOfType(VariableDeclarationCode).forEach(vd => {
      const variableDeclaration = vd.node as VariableDeclaration;
      if (variableDeclaration.declarations[0].init.type === "CallExpression") {
        const callee = (variableDeclaration.declarations[0].init as CallExpression).callee as MemberExpression;
        if ((callee.object as Identifier).name === "React") {
          if ((callee.property as Identifier).name === "createClass") {
            vd.replace(this.createComponent(variableDeclaration.declarations[0]).node as VariableDeclarator);
          }
        }
      }
    });
    return root;
  }

  createComponent(varDec: VariableDeclarator): GenericJsNode {

    if (varDec.init.type !== "CallExpression") {
      throw new Error("Init value must be of type CallExpression");
    }
    if ((varDec.init as CallExpression).arguments[0].type !== "ObjectExpression") {
      throw new Error("Argument 0 must be an ObjectExpression");
    }
    const object = ((varDec.init as CallExpression).arguments[0]) as ObjectExpression;
    let body = new Array<GenericJsNode>();
    for (let prop of object.properties) {
      const property = prop as Property;
      if (property.value.type === "FunctionExpression") {
        let method = (
          <MethodDefinition key={(property.key as Identifier).name} kind='method'>
            {JsNode.fromNode(property.value)}
          </MethodDefinition>
        ) as GenericJsNode;
        body.push(method);
      }
    }
    const reactComponent = <MemberExpressionCode object="React" property="Component"/> as MemberExpressionCode;
    let component = new ClassDeclaration().build({
      id: (varDec.id as Identifier).name,
      superClass: reactComponent
    }, body);
    return component;
  }
}
