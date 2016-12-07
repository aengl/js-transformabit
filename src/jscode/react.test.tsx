import {
  ReactClassComponent,
  ReactComponent,
  ReactStatelessComponent,
  ReactComponentRender,
  JsCode
} from '../JsCode';

describe('jscode/react', () => {
  it('ReactStatelessComponent', () => {
    let empty = (
      <ReactStatelessComponent name='Foo' />
    );
    expect(empty.format()).toBe(
`const Foo = props => {};`);
  });

  it('ReactComponent', () => {
    let empty = (
      <ReactComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
      </ReactComponent>
    );
    expect(empty.format()).toBe(
`const Foo = React.createClass({
    render() {
        return <div>bar!</div>;
    }
});`);
  });

  it('ReactClassComponent', () => {
    let empty = (
      <ReactClassComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
      </ReactClassComponent>
    );
    expect(empty.format()).toBe(
`class Foo extends React.Component {
    render() {
        return <div>bar!</div>;
    }
}`);
  });
});
