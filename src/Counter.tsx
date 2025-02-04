import { useState, useEffect, useMemo, createElement } from './lib';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  const doubleCount = useMemo(() => {
    console.log('Calculating double...');
    return count * 2;
  }, [count]);

  useEffect(() => {
    console.log('Count changed to:', count);
    return () => {
      console.log('Cleaning up with count:', count);
    };
  }, [count]);

  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
    </div>
  );
}