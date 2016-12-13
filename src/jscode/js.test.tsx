import {
  VariableDeclaration,
  VariableDeclarator,
  VariableKind,
  Literal,
  Identifier,
  CallExpression,
  BlockStatement,
  FunctionDeclaration,
  ExpressionStatement,
  ReturnStatement,
  ThisExpression,
  MemberExpression,
  AssignmentExpression,
  AssignmentOperator,
  ClassDeclaration,
  Property,
  PropertyKind,
  ObjectExpression,
  FunctionExpression,
  MethodDefinition,
  MethodKind,
  ReactClassComponent,
  ReactComponent,
  ReactStatelessComponent,
  NewExpression,
  JsCode
} from '../JsCode';

describe('jscode/js', () => {

  it('VariableDeclaration', () => {
    let foo = <VariableDeclaration name="foo" kind={VariableKind.Let}></VariableDeclaration>;
    expect(foo.format()).toBe("let foo;");

    let bar = new VariableDeclaration({ name: "bar" }, []);
    expect(bar.format()).toBe("var bar;");

    let letbar = new VariableDeclaration({ name: "bar", kind: VariableKind.Let }, []);
    expect(letbar.format()).toBe("let bar;");

    let foobar = (
      <VariableDeclaration kind={VariableKind.Let}>
        <VariableDeclarator name="foo" />
        <VariableDeclarator name="bar" />
      </VariableDeclaration>
    );

    expect(foobar.format()).toBe("let foo, bar;");


    let age = <VariableDeclaration name="age" kind={VariableKind.Let}><Literal value={3} /></VariableDeclaration>;
    expect(age.format()).toBe("let age = 3;");


    let bananasInPajamas = (
      <VariableDeclaration kind={VariableKind.Const}>
        <VariableDeclarator name="b1">
          <Literal value={1} />
        </VariableDeclarator>
        <VariableDeclarator name="b2">
          <Literal value={2} />
        </VariableDeclarator>
      </VariableDeclaration>
    );

    expect(bananasInPajamas.format()).toBe("const b1 = 1, b2 = 2;");

  });

  it('Literal', () => {
    let int = new Literal({ value: 8 });
    let bol = new Literal({ value: true });
    let str = new Literal({ value: "Hello" });
  });


  it('CallExpression', () => {
    let foo = <CallExpression callee={new Identifier({ name: "foo" })} />;
    expect(foo.format()).toBe("foo()");

    let isTall = (
      <CallExpression callee={new Identifier({ name: "isTall" })}>
        <Literal value={193} />
        <Identifier name="isMale" />
      </CallExpression>
    );

    expect(isTall.format()).toBe("isTall(193, isMale)");

    let toString = (
      <CallExpression callee={new Identifier({ name: "toString" })}>
        {isTall}
      </CallExpression>
    );
    expect(toString.format()).toBe("toString(isTall(193, isMale))");

    let thisFoo = <MemberExpression object={new ThisExpression({}, [])} property={new Identifier({ name: "foo" })} />;
    expect(thisFoo.format()).toBe("this.foo");
    let memberCall = (
      <CallExpression callee={thisFoo as MemberExpression}>
        <Identifier name="bar" />
      </CallExpression>
    );
    expect(memberCall.format()).toBe("this.foo(bar)");

  });

  it('BlockStatement', () => {
    let emptyBlock = (
      <BlockStatement></BlockStatement>
    );

    expect(emptyBlock.format()).toBe("{}");

    let simpleBlock = (
      <BlockStatement>
        <VariableDeclaration name="num" kind={VariableKind.Let}>
          <Literal value={3} />
        </VariableDeclaration>
      </BlockStatement>
    );

    expect(simpleBlock.format().replace(/\n/g, "")).toBe("{    let num = 3;}");
  });


  it('FunctionDeclaration', () => {
    let empty = <FunctionDeclaration name="skip" />;
    expect(empty.format()).toBe("function skip() {}");

    let emptyWithParams = (
      <FunctionDeclaration name="foo">
        <Identifier name="bar" />
        <Identifier name="baz" />
      </FunctionDeclaration>
    );
    expect(emptyWithParams.format()).toBe("function foo(bar, baz) {}");

    let blockWithNoParams = (
      <FunctionDeclaration name="foo">
        <BlockStatement>
          <VariableDeclaration name="num" kind={VariableKind.Let}>
            <Literal value={3} />
          </VariableDeclaration>
        </BlockStatement>
      </FunctionDeclaration>
    );
    expect(blockWithNoParams.format().replace(/\n/g, "")).toBe("function foo() {    let num = 3;}");

    let withParamsAndBody = (
      <FunctionDeclaration name="foo">
        <Identifier name="bar" />
        <Identifier name="baz" />
        <BlockStatement>
          <VariableDeclaration name="num" kind={VariableKind.Let}>
            <Literal value={3} />
          </VariableDeclaration>
        </BlockStatement>
      </FunctionDeclaration>
    );
    expect(withParamsAndBody.format().replace(/\n/g, "")).toBe("function foo(bar, baz) {    let num = 3;}");
  });

  it('ExpressionStatement', () => {
    let call = (
      <ExpressionStatement>
        <CallExpression callee={new Identifier({ name: "foo" })} />
      </ExpressionStatement>
    );
    expect(call.format()).toBe("foo();");

    let identifier = (
      <ExpressionStatement>
        <Identifier name="mevar" />
      </ExpressionStatement>
    );
    expect(identifier.format()).toBe("mevar;");
  });

  it('ReturnStatement', () => {
    let bol = (
      <ReturnStatement>
        <Literal value={true} />
      </ReturnStatement>
    );
    expect(bol.format()).toBe("return true;");

    let func = (
      <ReturnStatement>
        <CallExpression callee={new Identifier({ name: "toInt" })}>
          <Identifier name="approx" />
        </CallExpression>
      </ReturnStatement>
    );
    expect(func.format()).toBe("return toInt(approx);");

    let nothing = (
      <ReturnStatement />
    );
    expect(nothing.format()).toBe("return;");
  });

  it('ThisExpression', () => {
    let ths = <ThisExpression />;
    expect(ths.format()).toBe("this");
    let thss = new ThisExpression({}, []);
    expect(thss.format()).toBe("this");
  });


  it('MemberExpression', () => {
    let thisFoo = <MemberExpression
      object={new ThisExpression({}, [])}
      property={new Identifier({ name: "foo" })} />;
    expect(thisFoo.format()).toBe("this.foo");

    let noThis = <MemberExpression property={new Identifier({ name: "bar" })} />;
    expect(noThis.format()).toBe("this.bar");

    // this.prototype.func.foo
    let thisprototype = new MemberExpression(
      { property: new Identifier({ name: "prototype" }) }, []);
    let prototypefunc = new MemberExpression(
      { object: thisprototype, property: new Identifier({ name: "func" }) }, []);
    let funcfoo = new MemberExpression(
      { object: prototypefunc, property: new Identifier({ name: "foo" }) }, []);
    expect(funcfoo.format()).toBe("this.prototype.func.foo");
  });


  it('AssignmentExpression', () => {
    let variable = (
      <AssignmentExpression
        operator={AssignmentOperator.Equals}
        left={new Identifier({ name: "foo" })}
        right={new Literal({ value: "foo" })}
        />
    );
    expect(variable.format()).toBe("foo = \"foo\"");

    let limitFunc = (
      <CallExpression callee={new Identifier({ name: "limit" })}>
        <Literal value={4} />
      </CallExpression>
    );

    let fromFunc = (
      <AssignmentExpression
        operator={AssignmentOperator.MultiplyEquals}
        left={new Identifier({ name: "foo" })}
        right={limitFunc as CallExpression}
        />
    );
    expect(fromFunc.format()).toBe("foo *= limit(4)");

    let thisLevel = <MemberExpression
      object={new ThisExpression({}, [])}
      property={new Identifier({ name: "level" })} />;
    let memberAndIdentifier = (
      <AssignmentExpression
        operator={AssignmentOperator.Equals}
        left={thisLevel as MemberExpression}
        right={new Identifier({ name: "level" })}
        />
    );
    expect(memberAndIdentifier.format()).toBe("this.level = level");
  });


  it('MethodDefinition', () => {
      let empty = (
        <MethodDefinition key="bar" kind={MethodKind.Method}>
        </MethodDefinition>
      ) as MethodDefinition
      expect(empty.format().replace(/\n([\s]*)/g, "")).toBe("bar() {}");

      let notEmpty = (
        <MethodDefinition key="foo" kind={MethodKind.Method}>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true}/>
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
        </MethodDefinition>
      ) as MethodDefinition;
      expect(notEmpty.format().replace(/\n([\s]*)/g, "")).toBe("foo() {return true;}");
    });

  it('ClassDeclaration', () => {
      let empty = (
        <ClassDeclaration id="Foo" superClass={new Identifier({name: "Bar"})}>
        </ClassDeclaration>
      ) as ClassDeclaration
      expect(empty.format()).toBe("class Foo extends Bar {}");

      let withMethod = (
      <ClassDeclaration id="Foo" superClass={new Identifier({name: "Bar"})}>

        <MethodDefinition key="foo" kind={MethodKind.Method}>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true}/>
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
        </MethodDefinition>

      </ClassDeclaration>
      ) as ClassDeclaration;
      expect(withMethod.format().replace(/\n([\s]*)/g, "")).toBe("class Foo extends Bar {foo() {return true;}}");

      let withTwoMethods = (
        <ClassDeclaration id="Foo" superClass={new Identifier({name: "Bar"})}>
        <MethodDefinition key="bar" kind={MethodKind.Method}>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true}/>
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
          </MethodDefinition>
          <MethodDefinition key="foo" kind={MethodKind.Method}>
            <FunctionExpression>
              <BlockStatement>
                <ReturnStatement>
                  <Literal value={true}/>
                </ReturnStatement>
              </BlockStatement>
            </FunctionExpression>
          </MethodDefinition>

        </ClassDeclaration>
      ) as ClassDeclaration;
      expect(withTwoMethods.format().replace(/\n([\s]*)/g, "")).toBe("class Foo extends Bar {bar() {return true;}foo() {return true;}}");


    });


  it('FunctionExpression', () => {
    let empty = <FunctionExpression/> as FunctionExpression
     expect(empty.format()).toBe("function() {}");

     //let gen = <FunctionExpression generator={true}/> as FunctionExpression
     //expect(gen.format()).toBe("function*() {}");


    let blockWithNoParams = (
      <FunctionExpression>
        <BlockStatement>
          <VariableDeclaration name="num" kind={VariableKind.Let}>
            <Literal value={3}/>
          </VariableDeclaration>
        </BlockStatement>
      </FunctionExpression>
    ) as FunctionExpression
     expect(blockWithNoParams.format().replace(/\n([\s]*)/g, "")).toBe("function() {let num = 3;}")
  });


    it('Property', () => {
     let valAsChild = (
      <Property key="render" kind={PropertyKind.Init}>
        <FunctionExpression/>
      </Property>
    ) as Property;
    expect(valAsChild.format()).toBe("render: function() {}");

    let one = <Literal value={1}/> as Literal;
    let valAsProp = (
       <Property key="num" kind={PropertyKind.Init} value={one}>
      </Property>
    ) as Property;
    expect(valAsProp.format()).toBe("num: 1");
  });


  it('ObjectExpression', () => {
    let empty = (
       <ObjectExpression/>
    ) as ObjectExpression;
    expect(empty.format()).toBe("{}");

     let abc1 = (
      <ObjectExpression>
         <Property key="a" kind={PropertyKind.Init} value={new Literal({value: "a"})}/>
         <Property key="b" kind={PropertyKind.Init} value={new Literal({value: "b"})}/>
         <Property key="c" kind={PropertyKind.Init} value={new Literal({value: "c"})}/>
         <Property key="one" kind={PropertyKind.Init} value={new Literal({value:  1})}/>
       </ObjectExpression>
     ) as ObjectExpression;
    expect(abc1.format().replace(/\s/g, "")).toBe(`{a:"a",b:"b",c:"c",one:1}`);
   });

   it('NewExpression', () => {
     let newEmpty = (
       <NewExpression callee={new Identifier({name: "Object"})}>
       </NewExpression>
     ) as NewExpression;
     expect(newEmpty.format()).toBe("new Object()");

     let fewArgs = (
       <NewExpression callee={new Identifier({name: "Thing"})}>
          <Literal value={3}/>
          <Identifier name="bar"/>
          <Literal value="foo"/>
       </NewExpression>
     ) as NewExpression;
     expect(fewArgs.format()).toBe("new Thing(3, bar, \"foo\")");

   })
});
