import {
  ReactClassComponent,
  ReactComponent,
  ReactStatelessComponent,
  JsCode
} from '../JsCode';

describe('jscode/react', () => {
  it('ReactStatelessComponent', () => {
    let empty = (
      <ReactStatelessComponent name="Foo" />
    );
    expect(empty.format()).toBe(
`const Foo = props => {};`);
  });

  it('ReactComponent', () => {
    let empty = (
      <ReactComponent name="Foo" />
    );
    expect(empty.format()).toBe(
`const Foo = React.createClass({
    render() {}
});`);
  });

  it('ReactClassComponent', () => {
    let empty = (
      <ReactClassComponent name="Foo" />
    );
    expect(empty.format()).toBe(
`class Foo extends React.Component {
    render() {}
}`);
  });
});
