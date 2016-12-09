import {Transformation} from '../Transformation';
import {GenericJsNode, JsNode, NamedTypes as t} from '../JsNode';
import {CallExpression, ObjectExpression, MemberExpression, Identifier, VariableDeclaration, VariableDeclarator, Property, Node}  from 'ast-types';
import {Project} from '../Project';
import {ClassDeclaration, ClassBody, MethodDefinition, MethodKind, MemberExpression as MemberExpressionCode, Identifier as IdentifierCode, JsCode} from '../JsCode';


export class CreateClassToComponent implements Transformation {

  configure(args: any[]): void {

  }

  check(root: GenericJsNode, project: Project): boolean {
    const createClasses = root.findChildrenOfType(t.CallExpression).filter<CallExpression>(ce => {
      if (typeof ((ce.node().callee as MemberExpression).object as Identifier) === "undefined") {
        return false;
      }
      if (((ce.node().callee as MemberExpression).object as Identifier).name === "React") {
        return ((ce.node().callee as MemberExpression).property as Identifier).name === "createClass";
      }
    });
    return createClasses.length > 0;
  }


  apply(root: GenericJsNode, project: Project): GenericJsNode {

    const variableDeclrations = root.findChildrenOfType(t.VariableDeclaration).forEach(vd => {
      //const variableDeclaration = vd.node() as VariableDeclaration;
      if ((vd.node() as VariableDeclaration).declarations[0].init.type == "CallExpression") {
        const ce = (vd.node() as VariableDeclaration).declarations[0].init as CallExpression;
        if (((ce.callee as MemberExpression).object as Identifier).name === "React") {
          if (((ce.callee as MemberExpression).property as Identifier).name === "createClass") {
            vd.replace(this.createComponent((vd.node() as VariableDeclaration).declarations[0]).node() as VariableDeclarator);
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
          <MethodDefinition key={(property.key as Identifier).name} kind={MethodKind.Method}>
            {JsNode.fromNode(property.value)}
          </MethodDefinition>
        ) as GenericJsNode;
        body.push(method);
      }
    }
    const reactComponent = <MemberExpressionCode object="React" property="Component"/> as MemberExpressionCode
    let component = new ClassDeclaration({id:(varDec.id as Identifier).name, superClass: reactComponent}, body);
    return component;
  }
}