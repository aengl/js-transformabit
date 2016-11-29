
import * as ast from 'ast-types';


export class JsBuilder {

  identifier(name: string): ast.Identifier {
    return <ast.Identifier>ast.builders["identifier"](name);
  }


  /*========================================================================
                              Variable Delcaration
  =========================================================================*/


  variableDeclaration(kind: VariableKind, varName: string, init?: ast.Literal | ast.CallExpression | ast.Identifier): ast.VariableDeclaration {
    let kindString = "";
    if (kind == VariableKind.Let) {
      kindString = "let";
    } else if (kind == VariableKind.Var) {
      kindString = "var";
    } else if (kind == VariableKind.Const) {
      kindString = "const";
    }

    if (!init) {
      init = null;
    }

    return <ast.VariableDeclaration>ast.builders['variableDeclaration'](kindString, [this.variableDeclarator(varName)]);
  }

  private variableDeclarator(varName: string) {
    return ast.builders["variableDeclarator"](ast.builders["identifier"](varName), null);
  }


  /*========================================================================
                              Literal
  =========================================================================*/

  literal(value: string | number | boolean | null): ast.Literal {
    return <ast.Literal>ast.builders["literal"](value, value);
  }


  /*========================================================================
                              Call Expression
  =========================================================================*/

  callExpression(funcName: string, args?: ast.Assignable[]): ast.CallExpression {
    if (!args) {
      args = new Array<ast.Assignable>();
    }
    return <ast.CallExpression>ast.builders["callExpression"](this.identifier(funcName), args);
  }

}

export enum VariableKind {
  Let,
  Const,
  Var
}
