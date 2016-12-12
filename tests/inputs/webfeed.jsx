class WebFeed extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <ul>
                    {this.props.data.forEach(item => {
                        return (<li>{item.data}</li>);
                    })}
                </ul>
            </div>
        )
    }

}