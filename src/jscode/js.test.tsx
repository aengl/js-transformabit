import * as js from '../JsCode';

const JsCode = js.JsCode;

describe('jscode/js', () => {

  it('VariableDeclaration', () => {
    let foo = <js.VariableDeclaration name="foo" kind='let'></js.VariableDeclaration>;
    expect(foo.format()).toBe("let foo;");

    let bar = new js.VariableDeclaration().build({ name: "bar" }, []);
    expect(bar.format()).toBe("var bar;");

    let letbar = new js.VariableDeclaration().build({ name: "bar", kind: 'let' }, []);
    expect(letbar.format()).toBe("let bar;");

    let foobar = (
      <js.VariableDeclaration kind='let'>
        <js.VariableDeclarator name="foo" />
        <js.VariableDeclarator name="bar" />
      </js.VariableDeclaration>
    );

    expect(foobar.format()).toBe("let foo, bar;");

    let age = <js.VariableDeclaration name="age" kind='let'><js.Literal value={3} /></js.VariableDeclaration>;
    expect(age.format()).toBe("let age = 3;");

    let bananasInPajamas = (
      <js.VariableDeclaration kind='const'>
        <js.VariableDeclarator name="b1">
          <js.Literal value={1} />
        </js.VariableDeclarator>
        <js.VariableDeclarator name="b2">
          <js.Literal value={2} />
        </js.VariableDeclarator>
      </js.VariableDeclaration>
    );

    expect(bananasInPajamas.format()).toBe("const b1 = 1, b2 = 2;");
  });

  it('Literal', () => {
    expect(js.Literal.fromValue(8).format()).toBe('8');
    expect(js.Literal.fromValue(true).format()).toBe('true');
    expect(js.Literal.fromValue('Hello').format()).toBe('"Hello"');
  });

  it('Identifier', () => {
    expect(js.Identifier.fromName('foo').format()).toBe('foo');
    expect((<js.Identifier name='bar' />).format()).toBe('bar');
    expect(new js.Identifier().build({ name: 'baz' }, []).format()).toBe('baz');
  });

  it('CallExpression', () => {
    let foo = <js.CallExpression callee='foo' />;
    expect(foo.format()).toBe("foo()");

    let isTall = (
      <js.CallExpression callee='isTall'>
        <js.Literal value={193} />
        <js.Identifier name="isMale" />
      </js.CallExpression>
    );

    expect(isTall.format()).toBe("isTall(193, isMale)");

    let toString = (
      <js.CallExpression callee='toString'>
        {isTall}
      </js.CallExpression>
    );
    expect(toString.format()).toBe("toString(isTall(193, isMale))");

    let thisFoo = <js.MemberExpression object='this' property='foo' />;
    expect(thisFoo.format()).toBe("this.foo");
    let memberCall = (
      <js.CallExpression callee={thisFoo as js.MemberExpression}>
        <js.Identifier name="bar" />
      </js.CallExpression>
    );
    expect(memberCall.format()).toBe("this.foo(bar)");
  });

  it('BlockStatement', () => {
    let emptyBlock = (
      <js.BlockStatement></js.BlockStatement>
    );

    expect(emptyBlock.format()).toBe("{}");

    let simpleBlock = (
      <js.BlockStatement>
        <js.VariableDeclaration name="num" kind='let'>
          <js.Literal value={3} />
        </js.VariableDeclaration>
      </js.BlockStatement>
    );

    expect(simpleBlock.formatStripped()).toBe("{let num = 3;}");
  });

  it('FunctionDeclaration', () => {
    let empty = <js.FunctionDeclaration name="skip" />;
    expect(empty.format()).toBe("function skip() {}");

    let emptyWithParams = (
      <js.FunctionDeclaration name="foo">
        <js.Identifier name="bar" />
        <js.Identifier name="baz" />
      </js.FunctionDeclaration>
    );
    expect(emptyWithParams.format()).toBe("function foo(bar, baz) {}");

    let blockWithNoParams = (
      <js.FunctionDeclaration name="foo">
        <js.BlockStatement>
          <js.VariableDeclaration name="num" kind='let'>
            <js.Literal value={3} />
          </js.VariableDeclaration>
        </js.BlockStatement>
      </js.FunctionDeclaration>
    ) as js.FunctionDeclaration;
    expect(blockWithNoParams.formatStripped()).toBe("function foo() {let num = 3;}");

    blockWithNoParams.append(
      <js.VariableDeclaration name="max" kind='let'>
        <js.Literal value={6} />
      </js.VariableDeclaration> as js.GenericVariableDeclaration
    );
    expect(blockWithNoParams.formatStripped()).toBe("function foo() {let num = 3;let max = 6;}");

    let withParamsAndBody = (
      <js.FunctionDeclaration name="foo">
        <js.Identifier name="bar" />
        <js.Identifier name="baz" />
        <js.BlockStatement>
          <js.VariableDeclaration name="num" kind='let'>
            <js.Literal value={3} />
          </js.VariableDeclaration>
        </js.BlockStatement>
      </js.FunctionDeclaration>
    );
    expect(withParamsAndBody.formatStripped()).toBe("function foo(bar, baz) {let num = 3;}");
  });

  it('ExpressionStatement', () => {
    let call = (
      <js.ExpressionStatement>
        <js.CallExpression callee='foo' />
      </js.ExpressionStatement>
    );
    expect(call.format()).toBe("foo();");

    let identifier = (
      <js.ExpressionStatement>
        <js.Identifier name="mevar" />
      </js.ExpressionStatement>
    );
    expect(identifier.format()).toBe("mevar;");
  });

  it('ReturnStatement', () => {
    let bol = (
      <js.ReturnStatement>
        <js.Literal value={true} />
      </js.ReturnStatement>
    );
    expect(bol.format()).toBe("return true;");

    let func = (
      <js.ReturnStatement>
        <js.CallExpression callee='toInt'>
          <js.Identifier name="approx" />
        </js.CallExpression>
      </js.ReturnStatement>
    );
    expect(func.format()).toBe("return toInt(approx);");

    let nothing = (
      <js.ReturnStatement />
    );
    expect(nothing.format()).toBe("return;");
  });

  it('ThisExpression', () => {
    let ths = <js.ThisExpression />;
    expect(ths.format()).toBe("this");
    expect(js.ThisExpression.create().format()).toBe("this");
  });

  it('MemberExpression', () => {
    let thisFoo = <js.MemberExpression
      object={js.ThisExpression.create()}
      property='foo' />;
    expect(thisFoo.format()).toBe("this.foo");

    let noThis = <js.MemberExpression property='bar' />;
    expect(noThis.format()).toBe("this.bar");

    // this.prototype.func.foo
    let thisprototype = new js.MemberExpression().build(
      { property: 'prototype' }, []);
    let prototypefunc = new js.MemberExpression().build(
      { object: thisprototype, property: 'func' }, []);
    let funcfoo = new js.MemberExpression().build(
      { object: prototypefunc, property: 'foo' }, []);
    expect(funcfoo.format()).toBe("this.prototype.func.foo");
  });

  it('AssignmentExpression', () => {
    let variable = (
      <js.AssignmentExpression
        operator='='
        left='foo'
        right='foo' />
    );
    expect(variable.format()).toBe("foo = \"foo\"");

    let limitFunc = (
      <js.CallExpression callee='limit'>
        <js.Literal value={4} />
      </js.CallExpression>
    );

    let fromFunc = (
      <js.AssignmentExpression
        operator='*='
        left='foo'
        right={limitFunc as js.CallExpression}
        />
    );
    expect(fromFunc.format()).toBe("foo *= limit(4)");

    let thisLevel = <js.MemberExpression
      object={js.ThisExpression.create()}
      property='level' />;
    let memberAndIdentifier = (
      <js.AssignmentExpression
        operator='='
        left={thisLevel as js.MemberExpression}
        right={js.Identifier.fromName('level')} />
    );
    expect(memberAndIdentifier.format()).toBe("this.level = level");
  });

  it('MethodDefinition', () => {
    let empty = (
      <js.MethodDefinition key="bar" kind='method'>
      </js.MethodDefinition>
    );
    expect(empty.formatStripped()).toBe("bar() {}");

    let notEmpty = (
      <js.MethodDefinition key="foo" kind='method'>
        <js.FunctionExpression>
          <js.BlockStatement>
            <js.ReturnStatement>
              <js.Literal value={true} />
            </js.ReturnStatement>
          </js.BlockStatement>
        </js.FunctionExpression>
      </js.MethodDefinition>
    );
    expect(notEmpty.formatStripped()).toBe("foo() {return true;}");
  });

  it('ClassDeclaration', () => {
    let empty = (
      <js.ClassDeclaration id="Foo" superClass='Bar'>
      </js.ClassDeclaration>
    );
    expect(empty.format()).toBe("class Foo extends Bar {}");

    let withMethod = (
      <js.ClassDeclaration id="Foo" superClass='Bar'>

        <js.MethodDefinition key="foo" kind='method'>
          <js.FunctionExpression>
            <js.BlockStatement>
              <js.ReturnStatement>
                <js.Literal value={true} />
              </js.ReturnStatement>
            </js.BlockStatement>
          </js.FunctionExpression>
        </js.MethodDefinition>

      </js.ClassDeclaration>
    );
    expect(withMethod.formatStripped()).toBe("class Foo extends Bar {foo() {return true;}}");

    let withTwoMethods = (
      <js.ClassDeclaration id="Foo" superClass='Bar'>
        <js.MethodDefinition key="bar" kind='method'>
          <js.FunctionExpression>
            <js.BlockStatement>
              <js.ReturnStatement>
                <js.Literal value={true} />
              </js.ReturnStatement>
            </js.BlockStatement>
          </js.FunctionExpression>
        </js.MethodDefinition>
        <js.MethodDefinition key="foo" kind='method'>
          <js.FunctionExpression>
            <js.BlockStatement>
              <js.ReturnStatement>
                <js.Literal value={true} />
              </js.ReturnStatement>
            </js.BlockStatement>
          </js.FunctionExpression>
        </js.MethodDefinition>

      </js.ClassDeclaration>
    );
    expect(withTwoMethods.formatStripped()).toBe("class Foo extends Bar {bar() {return true;}foo() {return true;}}");
  });

  it('FunctionExpression', () => {
    let empty = <js.FunctionExpression />;
    expect(empty.format()).toBe("function() {}");

    // let gen = <js.FunctionExpression generator={true}/> as js.FunctionExpression
    // expect(gen.format()).toBe("function*() {}");

    let blockWithNoParams = (
      <js.FunctionExpression>
        <js.BlockStatement>
          <js.VariableDeclaration name="num" kind='let'>
            <js.Literal value={3} />
          </js.VariableDeclaration>
        </js.BlockStatement>
      </js.FunctionExpression>
    );
    expect(blockWithNoParams.formatStripped()).toBe("function() {let num = 3;}");
  });

  it('Property', () => {
    let valAsChild = (
      <js.Property key="render" kind='init'>
        <js.FunctionExpression />
      </js.Property>
    );
    expect(valAsChild.format()).toBe("render: function() {}");

    let valAsProp = (
      <js.Property key="num" kind='init' value={js.Literal.fromValue(1)} />
    );
    expect(valAsProp.format()).toBe("num: 1");
  });

  it('ObjectExpression', () => {
    let empty = (
      <js.ObjectExpression />
    );
    expect(empty.format()).toBe("{}");

    let abc1 = (
      <js.ObjectExpression>
        <js.Property key="a" kind='init'>a</js.Property>
        <js.Property key="b" kind='init'>b</js.Property>
        <js.Property key="c" kind='init'>c</js.Property>
        <js.Property key="one" kind='init' value={js.Literal.fromValue(1)} />
      </js.ObjectExpression>
    );
    expect(abc1.formatStripped()).toBe(`{a: "a",b: "b",c: "c",one: 1}`);
  });

  it('NewExpression', () => {
    let newEmpty = (
      <js.NewExpression callee='Object' />
    );
    expect(newEmpty.format()).toBe("new Object()");

    let fewArgs = (
      <js.NewExpression callee='Thing'>
        <js.Literal value={3} />
        <js.Identifier name="bar" />
        <js.Literal value="foo" />
      </js.NewExpression>
    );
    expect(fewArgs.format()).toBe("new Thing(3, bar, \"foo\")");

  });

  it('BinaryExpression', () => {
    let doubleEquals = (
      <js.BinaryExpression
        left={<js.Identifier name="foo" /> as js.Identifier}
        operator="=="
        right={<js.Identifier name="bar" /> as js.Identifier}
        />
    );
    expect(doubleEquals.format()).toBe("foo == bar");

    let tripleNotEquals = (
      <js.BinaryExpression
        left={<js.Identifier name="foo" /> as js.Identifier}
        operator="!=="
        right={<js.Identifier name="bar" /> as js.Identifier}
        />
    );
    expect(tripleNotEquals.format()).toBe("foo !== bar");

    let typeofCheck = (
      <js.BinaryExpression
        left={<js.UnaryExpression operator="typeof" arguement={<js.Identifier name="value"/> as js.Identifier}/> as js.UnaryExpression}
        operator="==="
        right={<js.Literal value="array"/> as js.Literal}
        />
    );
    expect(typeofCheck.format()).toBe("typeof value === \"array\"");
  });

  it('ImportDeclaration', () => {
    let foo = (
      <js.ImportSpecifier
        imported={<js.Identifier name="Foo" /> as js.Identifier}
        local={<js.Identifier name="Foo" /> as js.Identifier}
        />
    );

    let bar = (
      <js.ImportSpecifier
        imported={<js.Identifier name="Bar" /> as js.Identifier}
        local={<js.Identifier name="Bar" /> as js.Identifier}
        />
    );

    let one = (
      <js.ImportDeclaration source={<js.Literal value="Foo" /> as js.Literal}>
        {foo}
      </js.ImportDeclaration>
    );
    expect(one.format()).toBe("import { Foo } from \"Foo\";");

    let two = (
      <js.ImportDeclaration source={<js.Literal value="Foo" /> as js.Literal}>
        {foo}
        {bar}
      </js.ImportDeclaration>
    );
    expect(two.format()).toBe("import { Foo, Bar } from \"Foo\";");

    let specifiers = [foo, bar];
    let asArray = (
      <js.ImportDeclaration source={<js.Literal value="Foo" /> as js.Literal}>
        {specifiers}
      </js.ImportDeclaration>
    );
    expect(asArray.format()).toBe("import { Foo, Bar } from \"Foo\";");

    let barAsBaz = (
      <js.ImportSpecifier
        imported={<js.Identifier name="Bar" /> as js.Identifier}
        local={<js.Identifier name="Baz" /> as js.Identifier}
        />
    );
    let alias = (
      <js.ImportDeclaration source={<js.Literal value="Code" /> as js.Literal}>
        {barAsBaz}
      </js.ImportDeclaration>
    );
    expect(alias.format()).toBe("import { Bar as Baz } from \"Code\";");
  });


  it('ArrayExpression', () => {
    const vars = ['a', 'b', 'c'].map(
      s => (<js.Identifier name={s} />) as js.Identifier
    );
    const numbers = (<js.ArrayExpression elements={vars} />);
    expect(numbers.format()).toBe("[a, b, c]");
  });

  it('Program', () => {
    const empty = <js.Program />
    expect(empty.format()).toBe("");

    const single = (
      <js.Program>
        <js.ExpressionStatement>
          <js.AssignmentExpression operator='=' left='foo' right={<js.Identifier name="foo" /> as js.Identifier} />
        </js.ExpressionStatement>
      </js.Program>
    ) as js.Program;
    expect(single.format()).toBe("foo = foo;");

    single.append(
      <js.ExpressionStatement>
        <js.AssignmentExpression operator='=' left='bar' right={<js.Identifier name="bar" /> as js.Identifier} />
      </js.ExpressionStatement> as js.ExpressionStatement
    );
    expect(single.formatStripped()).toBe("foo = foo;bar = bar;");

    single.prepend(
      <js.ExpressionStatement>
        <js.AssignmentExpression operator='=' left='fofo' right={<js.Identifier name="fofo" /> as js.Identifier} />
      </js.ExpressionStatement> as js.ExpressionStatement
    );
    expect(single.formatStripped()).toBe("fofo = fofo;foo = foo;bar = bar;");

    single.insert(1,
      <js.ExpressionStatement>
        <js.AssignmentExpression operator='=' left='wolly' right={<js.Identifier name="wolly" /> as js.Identifier} />
      </js.ExpressionStatement> as js.ExpressionStatement
    );
    expect(single.formatStripped()).toBe("fofo = fofo;wolly = wolly;foo = foo;bar = bar;");
  });

  it('UnaryExpression', () => {
    const logicalNot = (<js.UnaryExpression operator="!" arguement={<js.Identifier name="success"/> as js.Identifier}/>);
    expect(logicalNot.formatStripped()).toBe("!success");

    const typeofCheck = (<js.UnaryExpression operator="typeof" arguement={<js.Identifier name="age"/> as js.Identifier}/>);
    expect(typeofCheck.formatStripped()).toBe("typeof age");

  });

   it('IfStatement', () => {
      const test1 = (
        <js.BinaryExpression
          left={<js.Identifier name="foo" /> as js.Identifier}
          operator="!=="
          right={<js.Identifier name="bar" /> as js.Identifier}
          />
      ) as js.BinaryExpression;

      const empty = (
        <js.IfStatement test={test1}/>
      ) as js.IfStatement;
      expect(empty.formatStripped()).toBe("if (foo !== bar){}");
      expect(empty.consequent().formatStripped()).toBe('{}');

      const blockStatement = (
        <js.BlockStatement>
          <js.ExpressionStatement>
            <js.AssignmentExpression
              operator='='
              left='c'
              right={<js.Identifier name="a"/> as js.Identifier} />
          </js.ExpressionStatement>
          <js.ExpressionStatement>
            <js.AssignmentExpression
              operator='='
              left='a'
              right={<js.Identifier name="b"/> as js.Identifier} />
          </js.ExpressionStatement>
          <js.ExpressionStatement>
            <js.AssignmentExpression
              operator='='
              left='b'
              right={<js.Identifier name="c"/> as js.Identifier}/>
          </js.ExpressionStatement>
        </js.BlockStatement>
      ) as js.GenericBlockStatement;

      const withBlockStatement = (
        <js.IfStatement test={test1}>
          {blockStatement}
        </js.IfStatement>
      ) as js.IfStatement;
      expect(withBlockStatement.formatStripped()).toBe("if (foo !== bar) {c = a;a = b;b = c;}");
      expect(withBlockStatement.consequent().formatStripped()).toBe("{c = a;a = b;b = c;}");


      const unary = (
        <js.UnaryExpression operator="!" arguement={<js.Identifier name="secret"/> as js.Identifier}/>
      ) as js.UnaryExpression;

      const singleStatement = (
        <js.IfStatement test={unary}>
          <js.ExpressionStatement>
            <js.AssignmentExpression
              operator='='
              left='secret'
              right={<js.Identifier name="password"/> as js.Identifier}/>
          </js.ExpressionStatement>
        </js.IfStatement>
      ) as js.IfStatement;
      expect(singleStatement.formatStripped()).toBe("if (!secret) {secret = password;}");
      expect(singleStatement.consequent().formatStripped()).toBe("{secret = password;}");

   });


   it('JSXIdentifier', () => {
     const id = (<js.JSXIdentifier name="div"/>);
     expect(id.format()).toBe("div");
   });

  it('JSXExpressionContainer', () => {
    const numProp = (<js.JSXExpressionContainer expression={3}/>);
    expect(numProp.format()).toBe("{3}");
    const bool = (<js.JSXExpressionContainer expression={true}/>);
    expect(bool.format()).toBe("{true}");

    const callExpressionProp = (<js.JSXExpressionContainer expression={<js.CallExpression callee="hello"/> as js.CallExpression}/>);
    expect(callExpressionProp.format()).toBe("{hello()}");

    const callExpressionChild = (<js.JSXExpressionContainer><js.CallExpression callee="hello"/></js.JSXExpressionContainer>);
    expect(callExpressionChild.format()).toBe("{hello()}");
  });

});

