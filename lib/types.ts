import { ComponentClass, FunctionComponent } from 'react';

export interface ActionContext {
	actions: Actions;
	state: State;
}

export interface ActionMap {
	[label: string]: Callback;
}

export interface Actions {
	call(name: string, state: State, ...args: any[]): any;
	get(name: string): Callback;
	wrap(name: string, state: State): Callback;
}

export interface Callback {
	(...args: any[]): void;
}

export type Component = ComponentClass | FunctionComponent;

export interface ConnectionMap {
	[label: string]: string;
}

export interface State {
	// ---------------------------------------------------------------------------
	// Generic methods
	// ---------------------------------------------------------------------------
	del(key: string): void;
	get(key: string, default_value?: any): any;
	has(key: string): boolean;
	set(key: string, value: any): void;

	// ---------------------------------------------------------------------------
	// Event methods
	// ---------------------------------------------------------------------------
	watch(key: string, callback: Callback): void;
	unwatch(key: string, callback: Callback): void;

	// ---------------------------------------------------------------------------
	// Array methods
	// ---------------------------------------------------------------------------
	getArray(key: string): any[];
	filter(key: string, new_key: string, callback: Callback): void;
	map(key: string, new_key: string, callback: Callback): void;
	reduce(key: string, new_key: string, callback: Callback, starting_value: any): void;
	pop(key: string): any;
	push(key: string, value: any): void;
	shift(key: string): any;
	unshift(key: string, value: any): void;

	// ---------------------------------------------------------------------------
	// Boolean methods
	// ---------------------------------------------------------------------------
	toggle(key: string): boolean
}

export interface StateMap {
	[label: string]: any;
}
