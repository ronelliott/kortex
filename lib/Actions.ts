import op from 'object-path';

import { ActionContext, ActionMap, Actions, Callback, State } from './types';

export default class ActionsImpl implements Actions {
	protected actions: ActionMap;

	constructor(actions: any) {
		if (!actions) throw new Error('No actions given');
		this.actions = actions;
	}

	call(name: string, state: State, ...args: any[]): any {
		const action = this.get(name);
		if (!action) throw new Error(`Undefined action: ${name}`);
		const context = this.getActionContext(state);
		return action(context, ...args);
	}

	get(name: string): Callback {
		return op.get(this.actions, name);
	}

	getActionContext(state: State): ActionContext {
		return {
			actions: this,
			state,
		};
	}

	wrap(name: string, state: State): Callback {
		const action = this.get(name);
		if (!action) throw new Error(`Undefined action: ${name}`);
		const context = this.getActionContext(state);
		return (...args: any[]) => action(context, ...args);
	}
}
