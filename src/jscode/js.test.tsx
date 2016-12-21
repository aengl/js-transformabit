import {
  JsCode,
  VariableDeclaration,
  VariableDeclarator,
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
  ClassDeclaration,
  Property,
  ObjectExpression,
  FunctionExpression,
  MethodDefinition,
  NewExpression,
  ImportSpecifier,
  ImportDeclaration,
  BinaryExpression
} from '../JsCode';

describe('jscode/js', () => {

  it('VariableDeclaration', () => {
    let foo = <VariableDeclaration name="foo" kind='let'></VariableDeclaration>;
    expect(foo.format()).toBe("let foo;");

    let bar = new VariableDeclaration().build({ name: "bar" }, []);
    expect(bar.format()).toBe("var bar;");

    let letbar = new VariableDeclaration().build({ name: "bar", kind: 'let' }, []);
    expect(letbar.format()).toBe("let bar;");

    let foobar = (
      <VariableDeclaration kind='let'>
        <VariableDeclarator name="foo" />
        <VariableDeclarator name="bar" />
      </VariableDeclaration>
    );

    expect(foobar.format()).toBe("let foo, bar;");

    let age = <VariableDeclaration name="age" kind='let'><Literal value={3} /></VariableDeclaration>;
    expect(age.format()).toBe("let age = 3;");

    let bananasInPajamas = (
      <VariableDeclaration kind='const'>
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
    expect(Literal.fromValue(8).format()).toBe('8');
    expect(Literal.fromValue(true).format()).toBe('true');
    expect(Literal.fromValue('Hello').format()).toBe('"Hello"');
  });

  it('CallExpression', () => {
    let foo = <CallExpression callee='foo' />;
    expect(foo.format()).toBe("foo()");

    let isTall = (
      <CallExpression callee='isTall'>
        <Literal value={193} />
        <Identifier name="isMale" />
      </CallExpression>
    );

    expect(isTall.format()).toBe("isTall(193, isMale)");

    let toString = (
      <CallExpression callee='toString'>
        {isTall}
      </CallExpression>
    );
    expect(toString.format()).toBe("toString(isTall(193, isMale))");

    let thisFoo = <MemberExpression object='this' property='foo' />;
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
        <VariableDeclaration name="num" kind='let'>
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
          <VariableDeclaration name="num" kind='let'>
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
          <VariableDeclaration name="num" kind='let'>
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
        <CallExpression callee='foo' />
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
        <CallExpression callee='toInt'>
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
    expect(ThisExpression.create().format()).toBe("this");
  });

  it('MemberExpression', () => {
    let thisFoo = <MemberExpression
      object={ThisExpression.create()}
      property='foo' />;
    expect(thisFoo.format()).toBe("this.foo");

    let noThis = <MemberExpression property='bar' />;
    expect(noThis.format()).toBe("this.bar");

    // this.prototype.func.foo
    let thisprototype = new MemberExpression().build(
      { property: 'prototype' }, []);
    let prototypefunc = new MemberExpression().build(
      { object: thisprototype, property: 'func' }, []);
    let funcfoo = new MemberExpression().build(
      { object: prototypefunc, property: 'foo' }, []);
    expect(funcfoo.format()).toBe("this.prototype.func.foo");
  });

  it('AssignmentExpression', () => {
    let variable = (
      <AssignmentExpression
        operator='='
        left='foo'
        right='foo' />
    );
    expect(variable.format()).toBe("foo = \"foo\"");

    let limitFunc = (
      <CallExpression callee='limit'>
        <Literal value={4} />
      </CallExpression>
    );

    let fromFunc = (
      <AssignmentExpression
        operator='*='
        left='foo'
        right={limitFunc as CallExpression}
        />
    );
    expect(fromFunc.format()).toBe("foo *= limit(4)");

    let thisLevel = <MemberExpression
      object={ThisExpression.create()}
      property='level' />;
    let memberAndIdentifier = (
      <AssignmentExpression
        operator='='
        left={thisLevel as MemberExpression}
        right={Identifier.fromName('level')} />
    );
    expect(memberAndIdentifier.format()).toBe("this.level = level");
  });

  it('MethodDefinition', () => {
    let empty = (
      <MethodDefinition key="bar" kind='method'>
      </MethodDefinition>
    );
    expect(empty.format().replace(/\n([\s]*)/g, "")).toBe("bar() {}");

    let notEmpty = (
      <MethodDefinition key="foo" kind='method'>
        <FunctionExpression>
          <BlockStatement>
            <ReturnStatement>
              <Literal value={true} />
            </ReturnStatement>
          </BlockStatement>
        </FunctionExpression>
      </MethodDefinition>
    );
    expect(notEmpty.format().replace(/\n([\s]*)/g, "")).toBe("foo() {return true;}");
  });

  it('ClassDeclaration', () => {
    let empty = (
      <ClassDeclaration id="Foo" superClass='Bar'>
      </ClassDeclaration>
    );
    expect(empty.format()).toBe("class Foo extends Bar {}");

    let withMethod = (
      <ClassDeclaration id="Foo" superClass='Bar'>

        <MethodDefinition key="foo" kind='method'>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true} />
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
        </MethodDefinition>

      </ClassDeclaration>
    );
    expect(withMethod.format().replace(/\n([\s]*)/g, "")).toBe("class Foo extends Bar {foo() {return true;}}");

    let withTwoMethods = (
      <ClassDeclaration id="Foo" superClass='Bar'>
        <MethodDefinition key="bar" kind='method'>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true} />
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
        </MethodDefinition>
        <MethodDefinition key="foo" kind='method'>
          <FunctionExpression>
            <BlockStatement>
              <ReturnStatement>
                <Literal value={true} />
              </ReturnStatement>
            </BlockStatement>
          </FunctionExpression>
        </MethodDefinition>

      </ClassDeclaration>
    );
    expect(withTwoMethods.format().replace(/\n([\s]*)/g, "")).toBe("class Foo extends Bar {bar() {return true;}foo() {return true;}}");
  });

  it('FunctionExpression', () => {
    let empty = <FunctionExpression />;
    expect(empty.format()).toBe("function() {}");

    // let gen = <FunctionExpression generator={true}/> as FunctionExpression
    // expect(gen.format()).toBe("function*() {}");

    let blockWithNoParams = (
      <FunctionExpression>
        <BlockStatement>
          <VariableDeclaration name="num" kind='let'>
            <Literal value={3} />
          </VariableDeclaration>
        </BlockStatement>
      </FunctionExpression>
    );
    expect(blockWithNoParams.format().replace(/\n([\s]*)/g, "")).toBe("function() {let num = 3;}");
  });

  it('Property', () => {
    let valAsChild = (
      <Property key="render" kind='init'>
        <FunctionExpression />
      </Property>
    );
    expect(valAsChild.format()).toBe("render: function() {}");

    let valAsProp = (
      <Property key="num" kind='init' value={Literal.fromValue(1)} />
    );
    expect(valAsProp.format()).toBe("num: 1");
  });

  it('ObjectExpression', () => {
    let empty = (
      <ObjectExpression />
    );
    expect(empty.format()).toBe("{}");

    let abc1 = (
      <ObjectExpression>
        <Property key="a" kind='init'>a</Property>
        <Property key="b" kind='init'>b</Property>
        <Property key="c" kind='init'>c</Property>
        <Property key="one" kind='init' value={Literal.fromValue(1)} />
      </ObjectExpression>
    );
    expect(abc1.format().replace(/\s/g, "")).toBe(`{a:"a",b:"b",c:"c",one:1}`);
  });

  it('NewExpression', () => {
    let newEmpty = (
      <NewExpression callee='Object' />
    );
    expect(newEmpty.format()).toBe("new Object()");

    let fewArgs = (
      <NewExpression callee='Thing'>
        <Literal value={3} />
        <Identifier name="bar" />
        <Literal value="foo" />
      </NewExpression>
    );
    expect(fewArgs.format()).toBe("new Thing(3, bar, \"foo\")");

  });

  it('BinaryExpression', () => {
    let doubleEquals = (
      <BinaryExpression
        left={<Identifier name="foo" /> as Identifier}
        operator="=="
        right={<Identifier name="bar" /> as Identifier}
        />
    )
    expect(doubleEquals.format()).toBe("foo == bar");

    let tripleNotEquals = (
      <BinaryExpression
        left={<Identifier name="foo" /> as Identifier}
        operator="!=="
        right={<Identifier name="bar" /> as Identifier}
        />
    )
    expect(tripleNotEquals.format()).toBe("foo !== bar");
  });

  it('ImportDeclaration', () => {
    let foo = (
      <ImportSpecifier
        imported={<Identifier name="Foo" /> as Identifier}
        local={<Identifier name="Foo" /> as Identifier}
        />
    );

    let bar = (
      <ImportSpecifier
        imported={<Identifier name="Bar" /> as Identifier}
        local={<Identifier name="Bar" /> as Identifier}
        />
    );

    let one = (
      <ImportDeclaration source={<Literal value="Foo" /> as Literal}>
        {foo}
      </ImportDeclaration>
    );
    expect(one.format()).toBe("import { Foo } from \"Foo\";");

    let two = (
      <ImportDeclaration source={<Literal value="Foo" /> as Literal}>
        {foo}
        {bar}
      </ImportDeclaration>
    );
    expect(two.format()).toBe("import { Foo, Bar } from \"Foo\";");

    let specifiers = [foo, bar];
    let asArray = (
      <ImportDeclaration source={<Literal value="Foo" /> as Literal}>
        {specifiers}
      </ImportDeclaration>
    );
    expect(asArray.format()).toBe("import { Foo, Bar } from \"Foo\";");

    let barAsBaz = (
      <ImportSpecifier
        imported={<Identifier name="Bar" /> as Identifier}
        local={<Identifier name="Baz" /> as Identifier}
        />
    );
    let alias = (
      <ImportDeclaration source={<Literal value="Code" /> as Literal}>
        {barAsBaz}
      </ImportDeclaration>
    );
    expect(alias.format()).toBe("import { Bar as Baz } from \"Code\";");

  });
});



