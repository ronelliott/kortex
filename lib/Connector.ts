import React from 'react';

import { Actions, Component, ConnectionMap, State } from './types';

export default class Connector {
	protected actions: Actions;
	protected state: State;

	constructor(actions: Actions, state: State) {
		if (!actions) throw new Error('No actions given');
		if (!state) throw new Error('No state given');
		this.actions = actions;
		this.state = state;
	}

	connect(component: Component, requested: ConnectionMap) {
		const state_keys = Object.values(requested);
		const connector = this;

		return class ConnectedComponent extends React.Component {
			componentDidMount() {
				state_keys.map(key => {
					const { sub_path } = connector.parsePath(key);
					connector.state.watch(sub_path, this.doForceUpdate);
				});
			}

			componentWillUnmount() {
				state_keys.map(key => {
					const { sub_path } = connector.parsePath(key);
					connector.state.unwatch(sub_path, this.doForceUpdate);
				});
			}

			doForceUpdate = () => this.forceUpdate();

			render() {
				return React.createElement(
					component,
					{
						...this.props,
						...connector.getAll(requested),
					},
					this.props.children
				);
			}
		};
	}

	get(path: string): any {
		const { source, sub_path } = this.parsePath(path);

		if (source == 'actions') {
			return this.actions.wrap(sub_path, this.state);
		}

		else if (source == 'state') {
			return this.state.get(sub_path);
		}

		throw new Error(`Unknown source: "${source}"`);
	}

	getAll(paths: ConnectionMap): any {
		return Object.entries(paths).reduce(
			(all: any, [name, path]) => {
				all[name] = this.get(path);
				return all;
			},
		{});
	}

	parsePath(path: string): {
		source: string;
		sub_path: string;
	} {
		const source = path.substr(0, path.indexOf('.'));
		const sub_path = path.substr(source.length + 1);

		return {
			source,
			sub_path,
		}
	}
}
