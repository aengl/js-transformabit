import * as ast from 'ast-types';
import { JsBuilder , VariableKind} from './jsbuilder';

const t = ast.namedTypes;

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
});
