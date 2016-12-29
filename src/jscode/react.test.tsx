import { JsNode} from '../JsNode';
import {
  ReactClassComponent,
  ReactComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  ReactComponentEventHandler,
  ReturnStatement,
  Literal,
  JsCode
} from '../JsCode';

describe('jscode/react', () => {
  it('ReactStatelessComponent', () => {
    let component = (
      <ReactStatelessComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
      </ReactStatelessComponent>
    );
    expect(component.format()).toBe(
`const Foo = props => <div>bar!</div>;`);
  });

  it('ReactComponent', () => {
    let component = (
      <ReactComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
        <ReactComponentEventHandler name='bar'>
          <ReturnStatement>
            <Literal value={42} />
          </ReturnStatement>
        </ReactComponentEventHandler>
      </ReactComponent>
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
      <ReactClassComponent id='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
        <ReactComponentEventHandler name='bar'>
          <ReturnStatement>
            <Literal value={42} />
          </ReturnStatement>
        </ReactComponentEventHandler>
      </ReactClassComponent>
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

  it('ReactClassComponent -> ReactComponent', () => {
    let component = (
      <ReactClassComponent id='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
        <ReactComponentEventHandler name='bar'>
          <ReturnStatement>
            <Literal value={42} />
          </ReturnStatement>
        </ReactComponentEventHandler>
      </ReactClassComponent>
    ) as ReactClassComponent;
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
      <ReactComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
        <ReactComponentEventHandler name='bar'>
          <ReturnStatement>
            <Literal value={42} />
          </ReturnStatement>
        </ReactComponentEventHandler>
      </ReactComponent>
    ) as ReactComponent;
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

  it('Find ReactClassComponent', () => {
    const code = 'class Foo extends React.Component {}';
    // This test is tricky because ReactComponent is not a primitive type, so
    // the JsNode factory would produce a ClassDeclaration under normal
    // circumstances. Since we tell findFirstChildOfType() to get us a
    // ReactComponent, however, we expect it to return the correct type.
    const node = JsNode.fromModuleCode(code)
      .findFirstChildOfType(ReactClassComponent);
    expect(node).toBeDefined();
    expect(node.constructor.name).toBe('ReactClassComponent');
    expect(node instanceof ReactClassComponent).toBe(true);
  });
});
