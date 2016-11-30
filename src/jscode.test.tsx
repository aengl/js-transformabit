
import {VariableDeclaration, VariableDeclarator, VariableKind, Literal, Identifier, CallExpression, JsCode} from './jscode'



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


    it('CallExpression', () => {
      let foo = <CallExpression name="foo"/> as CallExpression
      expect(foo.format()).toBe("foo()");

      let isTall = (
          <CallExpression name="isTall">
            <Literal value={193}/>
            <Identifier name="isMale"/>
          </CallExpression>
      ) as CallExpression

      expect(isTall.format()).toBe("isTall(193, isMale)");

      let toString = (
          <CallExpression name="toString">
            {isTall}
          </CallExpression>
      ) as CallExpression

      expect(toString.format()).toBe("toString(isTall(193, isMale))");
    });

});
