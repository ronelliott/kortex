const React = require("react");
const EventEmitter = require("events");
const objectPath = require("object-path");

let state = {};
const actions = {};
const events = new EventEmitter();
const updates = new EventEmitter();

const context = {
	actions,
	state,
}

const action = name => params => run(name, params);

const connect = (requested, Component) => {
	if (typeof Component == "undefined") {
		Component = requested;
		requested = {};
	}

	const keys = Object.keys(requested).map(name => requested[name]);

	return class extends React.Component {
		constructor() {
			super()
			this.doUpdate = this.doUpdate.bind(this);
		}

		doUpdate() {
			this.forceUpdate();
		}

		componentDidMount() {
			keys.map(key => updates.on(key, this.doUpdate));
		}

		componentWillUnmount() {
			keys.map(key => updates.removeListener(key, this.doUpdate));
		}

		render() {
			return React.createElement(
				Component,
				{ ...this.props, ...props(requested), run },
				this.props.children);
		}
	}
}

const filter = (key, intoKey, callback) => {
	if (typeof intoKey == 'function' && typeof callback == 'undefined') {
		callback = intoKey;
		intoKey = key;
	}

	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot filter non-array "${key}"`);
		return;
	}

	const filtered = values.filter(callback);
	set(intoKey, filtered);
	return filtered;
}

const get = path => objectPath.get(state, path);

const map = (key, intoKey, callback) => {
	if (typeof intoKey == 'function' && typeof callback == 'undefined') {
		callback = intoKey;
		intoKey = key;
	}

	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot map non-array "${key}"`);
		return;
	}

	const mapped = values.map(callback);
	set(intoKey, mapped);
	return mapped;
}

const mod = (namespace, mod) => {
	if (mod.actions) {
		actions[namespace] = mod.actions;
	}

	if (mod.state) {
		state[namespace] = mod.state;
	}
}

const mods = modules => modules.forEach(m => mod(m[0], m[1]));

const pop = key => {
	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot pop from non-array "${key}"`);
		return;
	}

	const value = values.pop();
	set(key, values);
	return value;
}

const props = requested => {
	const context = {
		actions,
		state,
	}

	return Object.keys(requested).reduce((all, name) => {
		let path = requested[name];
		let source = path.substr(0, path.indexOf("."));
		path = path.substr(source.length + 1);

		if (source == "state") {
			all[name] = objectPath.get(state, path);
		}

		else if (source == "actions") {
			all[name] = action(path);
		}

		else {
			console.error(`Unknown source: "${source}"`);
		}

		return all;
	}, {});
}

const push = (key, value) => {
	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot push into non-array "${key}"`);
		return;
	}

	values.push(value);
	set(key, values);
}

const reduce = (key, intoKey, callback, defaultValue) => {
	if (typeof intoKey == 'function' && typeof callback !== 'function') {
		defaultValue = callback;
		callback = intoKey;
		intoKey = key;
	}

	if (typeof defaultValue == 'undefined') {
		defaultValue = [];
	}

	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot reduce non-array "${key}"`);
		return;
	}

	const reduced = values.reduce(callback, defaultValue);
	set(intoKey, reduced);
	return reduced;
}

const unshift = (key, value) => {
	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot unshift into non-array "${key}"`);
		return;
	}

	values.unshift(value);
	set(key, values);
}

const run = (name, params) => {
	if (Array.isArray(name)) return name.forEach(n => run(n, params));

	let action = objectPath.get(actions, name);
	if (!action) throw `Unknown action "${name}" requested`;

	let prefix = name.substr(0, name.lastIndexOf("."));
	const ctx = {
		params,
		state: {
			data: state,
			get: key => get(`${prefix}.${key}`),
			pop: key => pop(`${prefix}.${key}`),
			push: (key, value) => push(`${prefix}.${key}`, value),
			set: (key, value) => set(`${prefix}.${key}`, value),
			shift: key => shift(`${prefix}.${key}`),
			unshift: (key, value) => unshift(`${prefix}.${key}`, value),
		}
	}

	if (typeof action == "function") return action(ctx);
	else if (Array.isArray(action)) return action.map(a => a(ctx));
}

const set = (key, value) => {
	let newState = { ...state };
	objectPath.set(newState, key, value);
	update(newState);
	updates.emit(`state.${key}`, key, value);
}

const shift = key => {
	const values = get(key) || [];

	if (!Array.isArray(values)) {
		console.log(`Cannot shift from non-array "${key}"`);
		return;
	}

	const value = values.shift();
	set(key, values);
	return value;
}

const toggle = key => set(key, !get(key));

const toggler = key => () => toggle(key);

const togglerAction = key => ({ state }) => state.set(key, !state.get(key));

const update = newState => {
	state = newState;
	context.state = state;
	module.exports.state = state;
}

const updater = key => value => set(key, value);

const updaterEvent = key => event => set(key, event.target.value);

const updaterAction = key => ({ params, state }) => state.set(key, params);
const updaterEventAction = key => ({ params, state }) => state.set(key, params.target.value);

module.exports = {
	action,
	actions,
	connect,
	events,
	filter,
	get,
	map,
	mod,
	mods,
	module: mod,
	modules: mods,
	pop,
	props,
	push,
	reduce,
	run,
	set,
	shift,
	state,
	toggle,
	toggler,
	togglerAction,
	unshift,
	update,
	updater,
	updaterEvent,
	updaterAction,
	updaterEventAction,
	updates,
}
