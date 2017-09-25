class EventListener {
    constructor() {
        this._listeners = new Map();
    }

    notify(event, data) {
        let handlers = this._listeners.get(event);
        if (typeof handlers === 'undefined') {
            return;
        }

        for (let handler of handlers) {
            handler(data);
        }
    }

    on(event, handler) {
        let handlers = this._listeners.get(event);

        if (typeof handlers === 'undefined') {
            handlers = new Set();
            this._listeners.set(event, handlers);
        } else if (handlers.has(handler)) {
            return false;
        }

        handlers.add(handler);

        return true;
    }

    off(event, handler) {
        let handlers = this._listeners.get(event);
        if (handlers === 'undefined') {
            return false;
        } else if (!handlers.has(handler)) {
            return false;
        }
        handlers.delete(handler);

        return true;
    }
}
