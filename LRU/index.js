module.exports = class LRUCache {
    constructor(size) {
        this.size = size;
        this.cache = new Map();
    }
    _has(key) {
        return this.cache.has(key);
    }
    _get(key) {
        if (!this._has(key)) {
            throw new Error("cache excluding key");
        }
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    _set(key, value) {
        if (this.cache.size === this.size) {
            this.cache.delete(this.cache.keys().next().value);
        }
        this.cache.set(key, value);
    }
}
