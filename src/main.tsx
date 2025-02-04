import App from "./App";
import { render, createElement } from "./lib";

const root = document.getElementById('app');
if (!root) throw new Error('Root element not found');

render(<App />, root);