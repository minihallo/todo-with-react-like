import { FunctionComponentInstance } from "./component/instance";
import { globalState } from "./globalState";
import { reconcile } from "./vdom/reconciler";

let currentInstance: FunctionComponentInstance | null = null;
let currentIndex = 0;

function scheduleComponentUpdate(instance: FunctionComponentInstance) {
    Promise.resolve().then(() => {
      const { parentDom, type: componentFunction, props } = instance;
      const oldVNode = instance._vnode;
  
      resetHooksState(instance);
      const newVNode = componentFunction(props);
  
      reconcile(parentDom, oldVNode, newVNode);
  
      instance._vnode = newVNode;
    });
  }

export function resetHooksState(instance: FunctionComponentInstance) {
  currentInstance = instance;
  currentIndex = 0;
}

export function useState<T>(
  initialValue: T
): [T, (newValue: T | ((prev: T) => T)) => void] {
  if (!currentInstance) {
    throw new Error("useState must be used within a function component");
  }

  const instance = currentInstance;
  const index = currentIndex++;

  // 초기 상태 설정
  if (currentInstance.hooks[index] === undefined) {
    currentInstance.hooks[index] = {
      type: "state",
      value:
        typeof initialValue === "function"
          ? (initialValue as Function)()
          : initialValue,
    };
  }

  const setState = (newValue: T | ((prev: T) => T)) => {
    const hooks = instance.hooks;
    const prevValue = hooks[index].value;

    const nextValue =
      typeof newValue === "function"
        ? (newValue as Function)(prevValue)
        : newValue;

    if (prevValue !== nextValue) {
      hooks[index].value = nextValue;
      scheduleComponentUpdate(instance);
    }
  };

  return [currentInstance.hooks[index].value, setState];
}

export function useEffect(callback: () => void | (() => void), deps?: any[]) {
  if (!currentInstance) {
    throw new Error("useEffect must be used within a function component");
  }

  const index = currentIndex++;
  const hooks = currentInstance.hooks;

  if (!hooks[index] || !deps || !arraysEqual(hooks[index].deps, deps)) {
    // 이전 cleanup 실행
    if (hooks[index]?.cleanup) {
      hooks[index].cleanup();
    }

    hooks[index] = {
      type: "effect",
      deps,
      cleanup: undefined,
    };

    // 새로운 effect 예약
    Promise.resolve().then(() => {
      const cleanup = callback();
      hooks[index].cleanup =
        typeof cleanup === "function" ? cleanup : undefined;
    });
  }
}

export function useMemo<T>(factory: () => T, deps: any[]): T {
  if (!currentInstance) {
    throw new Error("useMemo must be used within a function component");
  }

  const index = currentIndex++;
  const hooks = currentInstance.hooks;

  if (!hooks[index] || !arraysEqual(hooks[index].deps, deps)) {
    hooks[index] = {
      type: "memo",
      value: factory(),
      deps,
    };
  }

  return hooks[index].value;
}

export function useGlobalState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  if (!currentInstance) {
    throw new Error("useGlobalState must be used within a function component");
  }

  console.log('useGlobalState 호출 시점의 currentInstance:', currentInstance?.type.name);

  if (globalState.getState(key) === undefined) {
    globalState.setState(key, initialValue);
  }

  const [state, setState] = useState(globalState.getState(key));

  useEffect(() => {
    const updateState = setState;
    return globalState.subscribe(key, () => {
      updateState(globalState.getState(key));
    });
  }, [key]);

  const updateState = (value: T) => {
    globalState.setState(key, value);
  };
  
  return [state, updateState];
}

function arraysEqual(a: any[] | undefined, b: any[] | undefined): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}
