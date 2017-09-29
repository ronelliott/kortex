const React = require("react");
const EventEmitter = require("events");
const objectPath = require("object-path");
const async = require("async");

let state = {};
const actions = {};
const updates = new EventEmitter();

const context = {
	actions,
	state,
}

const action = name => (params, callback) => run(name, params, callback)

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

const mod = (namespace, mod) => {
	if (mod.actions) {
		actions[namespace] = mod.actions;
	}

	if (mod.state) {
		state[namespace] = mod.state;
	}
}

const mods = modules => {
	modules.forEach(m => mod(m[0], m[1]))
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

const run = (name, params, callback) => {
	if (typeof params == "function" && typeof callback == "undefined") {
		callback = params;
		params = {};
	}

	if (typeof callback == "undefined") {
		callback = err => err && console.error(err)
	}

	let action = objectPath.get(actions, name);
	if (!action) return callback && callback(`Unknown action "${name}" requested`);

	const ctx = {
		params,
		state: {
			data: state,
			set: (key, value) => {
				set(`${name.substr(0, name.lastIndexOf("."))}.${key}`, value);
			},
		}
	}

	if (typeof action == "function") action(ctx, callback);
	else if (Array.isArray(action)) async.series(action.map(a => next => a(ctx, next)), callback);
}

const set = (key, value) => {
	let newState = { ...state };
	objectPath.set(newState, key, value);
	update(newState);
	updates.emit(`state.${key}`, key, value);
}

const update = newState => {
	state = newState;
	context.state = state;
	module.exports.state = state;
}

module.exports = {
	action,
	actions,
	connect,
	module: mod,
	modules: mods,
	props,
	run,
	set,
	state,
	update,
	updates,
}
