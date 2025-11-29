type Listener<T> = (data: T) => void;

export class WSEventBus {
  private listeners = new Map<string, Listener<any>[]>();

  on<T>(event: string, callback: Listener<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit<T>(event: string, data: T) {
    const items = this.listeners.get(event);
    if (!items) return;
    for (const cb of items) cb(data);
  }
}

export const wsEvents = new WSEventBus();
