type Listener = () => void;

class GlobalState {
  private store: Map<string, any> = new Map();
  private listeners: Map<string, Set<Listener>> = new Map();

  setState(key: string, newValue: any) {
    console.log('setState:', { key, oldValue: this.store.get(key), newValue});

    const oldValue = this.store.get(key);
    if (oldValue !== newValue) {
      this.store.set(key, newValue);
      console.log('notify listeners:', this.listeners.get(key)?.size);
      this.listeners.get(key)?.forEach((listener) => listener());
    }
  }

  getState(key: string) {
    console.log('getState:', { key, value: this.store.get(key) });
    return this.store.get(key);
  }

  subscribe(key: string, listener: Listener) {
    console.log('subscribe:', { key, listenersCount: this.listeners.get(key)?.size || 0 });
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }
}

export const globalState = new GlobalState();