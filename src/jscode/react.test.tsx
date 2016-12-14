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
});
