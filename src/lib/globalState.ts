type Listener = () => void;

class GlobalState {
  private store: Map<string, any> = new Map();
  private listeners: Map<string, Set<Listener>> = new Map();
  private pendingUpdates: Set<string> = new Set();
  private isProcessingUpdates = false;

  setState(key: string, newValue: any) {
    const oldValue = this.store.get(key);
    if (oldValue !== newValue) {
      this.store.set(key, newValue);
      this.pendingUpdates.add(key);
      this.scheduleUpdate();
    }
  }

  private scheduleUpdate() {
    if (!this.isProcessingUpdates) {
      this.isProcessingUpdates = true;
      Promise.resolve().then(() => {
        this.processPendingUpdates();
      });
    }
  }

  private processPendingUpdates() {
    const updatedKeys = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.isProcessingUpdates = false;

    // 모든 변경된 키에 대한 리스너를 한번에 실행
    const affectedListeners = new Set<Listener>();
    updatedKeys.forEach(key => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.forEach(listener => affectedListeners.add(listener));
      }
    });

    affectedListeners.forEach(listener => listener());
  }

  getState(key: string) {
    return this.store.get(key);
  }

  subscribe(key: string, listener: Listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }
}

export const globalState = new GlobalState();