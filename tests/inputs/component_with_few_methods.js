const MyComponent = React.createClass({
  render: function() {
    return (
      <div>
        Hello
      </div>
    )
  },
  foo: function() {
    return "foo";
  },
  onClick: function() {
    alert("Hello");
  }
})