
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


      let age = <VariableDeclaration name="age" kind={VariableKind.Let}><Literal value={3}/></VariableDeclaration> as VariableDeclaration
      expect(age.format()).toBe("let age = 3;");


      let bananasInPajamas = (
        <VariableDeclaration kind={VariableKind.Const}>
          <VariableDeclarator name="b1">
            <Literal value={1}/>
          </VariableDeclarator>
          <VariableDeclarator name="b2">
            <Literal value={2}/>
          </VariableDeclarator>
        </VariableDeclaration>
      ) as VariableDeclaration

      expect(bananasInPajamas.format()).toBe("const b1 = 1, b2 = 2;");

    });

    it('Literal', () => {
      let int = new Literal({value: 8});
      let bol = new Literal({value: true});
      let str = new Literal({value: "Hello"});
    });

});
