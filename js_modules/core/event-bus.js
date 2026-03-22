const listeners = new Map();

function on(eventName, handler) {
    if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
    }
    listeners.get(eventName).add(handler);
    return () => off(eventName, handler);
}

function off(eventName, handler) {
    if (!listeners.has(eventName)) return;
    listeners.get(eventName).delete(handler);
    if (listeners.get(eventName).size === 0) {
        listeners.delete(eventName);
    }
}

function emit(eventName, payload) {
    if (!listeners.has(eventName)) return;
    listeners.get(eventName).forEach(handler => handler(payload));
}

export const eventBus = { on, off, emit };
