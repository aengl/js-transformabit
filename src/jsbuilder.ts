
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
                                Function Declaration
    =========================================================================*/

    functionDeclaration(funcName: string, params?: string[] | ast.Identifier[], body?: ast.BlockStatement | ast.Expression): ast.FunctionDeclaration {

      if (!params || params.length < 1) {
        params = new Array<ast.Identifier>();
      } else if (typeof params[0] === 'string') {
        let newParams = new Array<ast.Identifier>(params.length);
        for (let i = 0; i < params.length; i++) {
          newParams[i] = this.identifier(<string>params[i]);
        }
        params = newParams;
      }

      if (!body) {
        body = this.blockStatement();
      }

      return <ast.FunctionDeclaration>ast.builders["functionDeclaration"](
        this.identifier(funcName),
        params,
        body
      );
    }

    blockStatement(): ast.BlockStatement {
      return <ast.BlockStatement>ast.builders["blockStatement"]([]);
    }

}

export enum VariableKind {
  Let,
  Const,
  Var
}
