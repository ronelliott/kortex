module.exports = connect;

const React = require('react');

const defaults = require('./default');

function connect(requested, Component, state = defaults.DefaultState) {
	const keys = Object.values(requested);

	return class ConnectedComponent extends React.Component {
		componentDidMount() {
			keys.map(key => state.watch(key, () => this.forceUpdate));
		}

		componentWillUnmount() {
			keys.map(key => state.unwatch(key, () => this.forceUpdate));
		}

		render() {
			return React.createElement(
				Component,
				{ ...this.props, ...props(requested) },
				this.props.children);
		}
	};
}
