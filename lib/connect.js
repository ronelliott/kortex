module.exports = connect;

const React = require('react');

const defaults = require('./defaults');

function connect(requested, Component, state) {
	state = state || defaults.getDefaultState();
	const state_keys = Object.values(requested);

	return class ConnectedComponent extends React.Component {
		componentDidMount() {
			state_keys.map(key => state.watch(key, () => this.forceUpdate));
		}

		componentWillUnmount() {
			state_keys.map(key => state.unwatch(key, () => this.forceUpdate));
		}

		render() {
			return React.createElement(
				Component,
				{ ...this.props, ...props(requested) },
				this.props.children);
		}
	};
}
