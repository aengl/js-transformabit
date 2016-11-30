
import {VariableDeclaration, VariableDeclarator, VariableKind, Literal, JsCode} from './jscode'



describe('jscode', () => {

    it('VariableDeclaration', () => {
      let foo = <VariableDeclaration name="foo" kind={VariableKind.Let}></VariableDeclaration> as VariableDeclaration
      expect(foo.format()).toBe("let foo;");

      let bar = new VariableDeclaration({name: "bar"}, []);
      expect(bar.format()).toBe("var bar;");

      let letbar = new VariableDeclaration({name: "bar", kind: VariableKind.Let}, []);
      expect(letbar.format()).toBe("let bar;");

      let foobar = (
        <VariableDeclaration kind={VariableKind.Let}>
          <VariableDeclarator name="foo"/>
          <VariableDeclarator name="bar"/>
        </VariableDeclaration>
      ) as VariableDeclaration

      expect(foobar.format()).toBe("let foo, bar;");

    });

    it('Literal', () => {
      let int = new Literal({value: 8});
      let bol = new Literal({value: true});
      let str = new Literal({value: "Hello"});
    });

});
