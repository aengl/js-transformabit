import * as js from './Js';
import * as react from './React';
import { JsNode } from './JsNode';
import { JsCode } from './JsCode';

describe('jscode/react', () => {
  it('ReactStatelessComponent', () => {
    let component = (
      <react.ReactStatelessComponent name='Foo'>
        <react.ReactComponentRender>
          {'<div>bar!</div>'}
        </react.ReactComponentRender>
      </react.ReactStatelessComponent>
    );
    expect(component.format()).toBe(
`const Foo = props => <div>bar!</div>;`);
  });

  it('ReactComponent', () => {
    let component = (
      <react.ReactComponent name='Foo'>
        <react.ReactComponentRender>
          {'<div>bar!</div>'}
        </react.ReactComponentRender>
        <react.ReactComponentEventHandler name='bar'>
          <js.ReturnStatement>
            <js.Literal value={42} />
          </js.ReturnStatement>
        </react.ReactComponentEventHandler>
      </react.ReactComponent>
    );
    expect(component.format()).toBe(
`const Foo = React.createClass({
    render() {
        return <div>bar!</div>;
    },

    bar(event) {
        return 42;
    }
});`);
  });

  it('ReactClassComponent', () => {
    let component = (
      <react.ReactClassComponent id='Foo'>
        <react.ReactComponentRender>
          {'<div>bar!</div>'}
        </react.ReactComponentRender>
        <react.ReactComponentEventHandler name='bar'>
          <js.ReturnStatement>
            <js.Literal value={42} />
          </js.ReturnStatement>
        </react.ReactComponentEventHandler>
      </react.ReactClassComponent>
    );
    expect(component.format()).toBe(
`class Foo extends React.Component {
    render() {
        return <div>bar!</div>;
    }

    bar(event) {
        return 42;
    }
}`);
  });

  it('Find ReactClassComponent', () => {
    const code = 'class Foo extends React.Component {}';
    // This test is tricky because ReactComponent is not a primitive type, so
    // the JsNode factory would produce a ClassDeclaration under normal
    // circumstances. Since we tell findFirstChildOfType() to get us a
    // ReactClassComponent, however, we expect it to return the correct type.
    const node = JsNode.fromModuleCode(code)
      .findFirstChildOfType(react.ReactClassComponent);
    expect(node).toBeDefined();
    expect(node.constructor.name).toBe('ReactClassComponent');
    expect(node instanceof react.ReactClassComponent).toBe(true);
  });

  it('ReactClassComponent collections', () => {
    const code = 'class Foo extends React.Component {}';
    // Tricky for similar reasons as the test above. Tests proper typing
    // of complex types in collections.
    const node = JsNode.fromModuleCode(code)
      .findChildrenOfType(react.ReactClassComponent)
      .filter(node => node.id().name === 'Foo')
      .at(0);
    expect(node).toBeDefined();
    expect(node.constructor.name).toBe('ReactClassComponent');
    expect(node instanceof react.ReactClassComponent).toBe(true);
  });

  it('ReactClassComponent methods', () => {
    const code = 'class Foo extends React.Component {}';
    const node = JsNode.fromModuleCode(code)
      .findFirstChildOfType(react.ReactClassComponent);
    expect(node.id().name).toBe('Foo');
  });

  it('ReactClassComponent -> ReactComponent', () => {
    let component = (
      <react.ReactClassComponent id='Foo'>
        <react.ReactComponentRender>
          {'<div>bar!</div>'}
        </react.ReactComponentRender>
        <react.ReactComponentEventHandler name='bar'>
          <js.ReturnStatement>
            <js.Literal value={42} />
          </js.ReturnStatement>
        </react.ReactComponentEventHandler>
      </react.ReactClassComponent>
    ) as react.ReactClassComponent;
    expect(component.convertToReactComponent().format()).toBe(
`const Foo = React.createClass({
    render() {
        return <div>bar!</div>;
    },

    bar(event) {
        return 42;
    }
});`);
  });

  it('ReactComponent -> ReactClassComponent', () => {
    let component = (
      <react.ReactComponent name='Foo'>
        <react.ReactComponentRender>
          {'<div>bar!</div>'}
        </react.ReactComponentRender>
        <react.ReactComponentEventHandler name='bar'>
          <js.ReturnStatement>
            <js.Literal value={42} />
          </js.ReturnStatement>
        </react.ReactComponentEventHandler>
      </react.ReactComponent>
    ) as react.ReactComponent;
    expect(component.convertToReactClassComponent().format()).toBe(
`class Foo extends React.Component {
    render() {
        return <div>bar!</div>;
    }

    bar(event) {
        return 42;
    }
}`);
  });
});
