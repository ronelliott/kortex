import { EventEmitter } from 'events';

import op from 'object-path';

import { Callback, StateMap, State } from './types';

export default class StateImpl extends EventEmitter implements State {
	protected store: StateMap;

	constructor(values?: StateMap) {
		super();
		this.store = { ...(values || {}) };
	}

	// ---------------------------------------------------------------------------
	// Generic methods
	// ---------------------------------------------------------------------------

	del(key: string): void {
		op.del(this.store, key);
		this.notifyUpdated(key);
	}

	get(key: string, default_value?: any): any {
		return op.coalesce(this.store, [key], default_value);
	}

	has(key: string): boolean {
		return op.has(this.store, key);
	}

	set(key: string, value: any): void {
		op.set(this.store, key, value);
		this.notifyUpdated(key, value);
	}

	// ---------------------------------------------------------------------------
	// Event methods
	// ---------------------------------------------------------------------------

	notifyUpdated(key: string, value?: any): void {
		this.emit(`updated:${key}`, value);
	}

	watch(key: string, callback: Callback): void {
		this.on(`updated:${key}`, callback);
	}

	unwatch(key: string, callback: Callback): void {
		this.removeListener(`updated:${key}`, callback);
	}

	// ---------------------------------------------------------------------------
	// Array methods
	// ---------------------------------------------------------------------------

	getArray(key: string): any[] {
		const value = this.get(key, []);

		if (!Array.isArray(value)) {
			throw new Error(`Key "${key}" is not an array`);
		}

		return value;
	}

	filter(key: string, new_key: string, callback: Callback): void {
		if (typeof new_key == 'function' && !callback) {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.filter(callback);

		this.set(new_key, new_values);
	}

	map(key: string, new_key: string, callback: Callback): void {
		if (typeof new_key == 'function' && !callback) {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.map(callback);

		this.set(new_key, new_values);
	}

	reduce(key: string, new_key: string, callback: Callback, starting_value: any = []): void {
		if (typeof new_key == 'function' && typeof callback != 'function') {
			callback = new_key;
			new_key = key;
		}

		const values = this.getArray(key);
		const new_values = values.reduce(callback, starting_value);

		this.set(new_key, new_values);
	}

	pop(key: string): any {
		const value = this.getArray(key).pop();
		this.notifyUpdated(key, this.getArray(key));
		return value;
	}

	push(key: string, value: any): void {
		this.getArray(key).push(value);
		this.notifyUpdated(key, this.getArray(key));
	}

	shift(key: string): any {
		const value = this.getArray(key).shift();
		this.notifyUpdated(key, this.getArray(key));
		return value;
	}

	unshift(key: string, value: any): void {
		this.getArray(key).unshift(value);
		this.notifyUpdated(key, this.getArray(key));
	}

	// ---------------------------------------------------------------------------
	// Boolean methods
	// ---------------------------------------------------------------------------

	toggle(key: string): boolean {
		const value = !this.get(key);
		this.set(key, value);
		return value;
	}
}
