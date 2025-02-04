import { createElement, useGlobalState } from "./lib";

export default function CounterB() {
    const [count, setCount] = useGlobalState('count', 0);
    
    return (
      <div>
        <h2>Counter B: {count}</h2>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  }