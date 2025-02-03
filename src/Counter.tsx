import { Component, createElement } from './lib';

class Counter extends Component<{}, { count: number }> {
  state = { count: 0 };

  increment = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  componentDidMount() {
    console.log('Counter mounted!');
  }

  componentDidUpdate(prevProps: {}, prevState: { count: number }) {
    console.log('Count changed from', prevState.count, 'to', this.state.count);
  }

  render() {
    return (
      <div className="counter">
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

export default Counter;