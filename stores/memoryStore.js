
class MemoryStore {
    constructor() {
        this._map = new Map();
        this.resolved = Promise.resolve();
    }

    ready() {
        return this.resolved;
    }

    get(key) {
        let value = this._map.get(key);
        if (value === undefined){
            value = null;
        }
        return Promise.resolve(value);
    }

    has(key) {
        return Promise.resolve(this._map.has(key));
    }

    set(key, value) {
        this._map.set(key, value);
        return Promise.resolve();
    }

    delete(key) {
        this._map.delete(key);
        return Promise.resolve();
    }
}

module.exports = MemoryStore;

