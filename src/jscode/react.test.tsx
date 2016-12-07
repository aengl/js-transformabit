import {
  ReactClassComponent,
  ReactComponent,
  ReactStatelessComponent,
  ReactComponentRender,
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
      </ReactComponent>
    );
    expect(component.format()).toBe(
`const Foo = React.createClass({
    render() {
        return <div>bar!</div>;
    }
});`);
  });

  it('ReactClassComponent', () => {
    let component = (
      <ReactClassComponent name='Foo'>
        <ReactComponentRender>
          {'<div>bar!</div>'}
        </ReactComponentRender>
      </ReactClassComponent>
    );
    expect(component.format()).toBe(
`class Foo extends React.Component {
    render() {
        return <div>bar!</div>;
    }
}`);
  });
});
