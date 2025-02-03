import Counter from "./Counter";
import { render, createElement } from "./lib";

const root = document.getElementById("app");
if (root) {
  render(<Counter />, root);
}
