import CounterA from "./CounterA";
import CounterB from "./CounterB";
import { createElement } from "./lib";

export default function AppForGlobalState() {
  return (
    <div>
      <CounterA />
      <CounterB />
    </div>
  );
}
