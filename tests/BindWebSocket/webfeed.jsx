class WebFeed extends React.Component {
    constructor(props) {
        super(props);
        this.connection = new WebSocket("wss://localhost");
    }

    onError() {}
    onOpen() {}
    onMessage() {}

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