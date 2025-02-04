import { createElement, useGlobalState } from "./lib";

export default function CounterA() {
    const [count, setCount] = useGlobalState('count', 0);
    
    return (
      <div>
        <h2>Counter A: {count}</h2>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  }