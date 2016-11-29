import * as ast from 'ast-types';
import { JsBuilder , VariableKind} from './jsbuilder';

describe('builder', () => {
    it('variable without value', () => {
        let builder = new JsBuilder();
        builder.variableDeclaration(VariableKind.Let, "socket");
        builder.variableDeclaration(VariableKind.Const, "max", builder.literal(8));
        builder.variableDeclaration(VariableKind.Const, "max", builder.callExpression("getMax"));
        builder.variableDeclaration(VariableKind.Const, "max", builder.identifier("anotherVar"));
    });

    it('call expression', () => {
        let builder = new JsBuilder();
        builder.callExpression("waitingTime");
        builder.callExpression("waitingTime", new Array<ast.Assignable>());
    });

    it('literals', () => {
        let builder = new JsBuilder();
        builder.literal("abcd");
        builder.literal(true);
        builder.literal(67);
    });

    it('function declaration', () => {
        let builder = new JsBuilder();
        builder.functionDeclaration("sayHello");

        let paramsAsIdentifiers: ast.Identifier[] = [
          builder.identifier("to"),
          builder.identifier("from")
        ];
        builder.functionDeclaration("sayHello", paramsAsIdentifiers);

        let paramsAsStrings: string[] = ["to", "from"];
        builder.functionDeclaration("sayHello", paramsAsStrings);
    });

    it('block statement', () => {
        let builder = new JsBuilder();
        builder.blockStatement();
    });


});
