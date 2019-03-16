const op = require('object-path');

const EventEmitter = require('events');

class State extends EventEmitter {
	constructor(values) {
		super();
		this.store = values;
	}

	// ---------------------------------------------------------------------------
	// Event methods
	// ---------------------------------------------------------------------------

	notifyUpdated(key, value) {
		this.emit(`updated:${key}`, value);
	}

	watch(key, callback) {
		this.on(`updated:${key}`, callback);
	}

	unwatch(key, callback) {
		this.removeListener(`updated:${key}`, callback);
	}

	// ---------------------------------------------------------------------------
	// Generic methods
	// ---------------------------------------------------------------------------

	del(key) {
		op.del(this.store || {}, key);
		this.notifyUpdated(key);
	}

	get(key, default_value) {
		return op.coalesce(this.store || {}, [key], default_value);
	}

	has(key) {
		return op.has(this.store || {}, key);
	}

	set(key, value) {
		op.set(this.store || {}, key, value);
		this.notifyUpdated(key, value);
	}

	// ---------------------------------------------------------------------------
	// Array methods
	// ---------------------------------------------------------------------------

	getArray(key) {
		const value = this.get(key, []);

		if (!Array.isArray(value)) {
			throw new Error(`Key "${key}" is not an array`);
		}

		return value;
	}

	filter(key, new_key, callback) {
		if (typeof new_key == 'function' && !callback) {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.filter(callback);

		this.set(new_key, new_values);
	}

	map(key, new_key, callback) {
		if (typeof new_key == 'function' && !callback) {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.map(callback);

		this.set(new_key, new_values);
	}

	reduce(key, new_key, callback, starting_value = []) {
		if (typeof new_key == 'function' && typeof callback != 'function') {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.reduce(callback, starting_value);

		this.set(new_key, new_values);
	}

	pop(key) {
		const value = this.getArray(key).pop();
		this.notifyUpdated(key, this.getArray(key));
		return value;
	}

	push(key, value) {
		this.getArray(key).push(value);
		this.notifyUpdated(key, this.getArray(key));
	}

	shift(key) {
		const value = this.getArray(key).shift();
		this.notifyUpdated(key, this.getArray(key));
		return value;
	}

	unshift(key, value) {
		this.getArray(key).unshift(value);
		this.notifyUpdated(key, this.getArray(key));
	}

	// ---------------------------------------------------------------------------
	// Boolean methods
	// ---------------------------------------------------------------------------

	toggle(key) {
		const value = !this.get(key);
		this.set(key, value);
		return value;
	}
}

module.exports = State;
