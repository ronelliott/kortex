# kortex

[![Build Status](https://travis-ci.org/ronelliott/kortex.svg?branch=master)](https://travis-ci.org/ronelliott/kortex)
[![Coverage Status](https://coveralls.io/repos/github/ronelliott/kortex/badge.svg?branch=master)](https://coveralls.io/github/ronelliott/kortex?branch=master)

Dead simple state management for react.

## Installation

    $ npm install kortex

## Examples

* [Counter](https://github.com/ronelliott/kortex-example-counter)

## Usage

### Initial setup

Before you can start connecting components you will need to create both your
actions as well as your state, and create a connector instance using these:

```javascript
import { Actions, Connector, State } from 'kortex';

const actions = new Actions({
  someAction: () => {},
  someOtherAction: () => {},
});

const state = new State({
  someStateValue: true,
  someOtherStateValue: 'totes',
});

const connector = new Connector(actions, state);
```

### Connecting

Connecting a component to the state should feel familiar, simply call `Connector.connect`,
passing an object mapping your component's interested keys to the expected prop
name, like so:

```javascript
function MyAwesomeComponent({ someAction, someStateValue }) {
  return (
    <span>Hello {someStateValue}</span>
  );
}

const MyAwesomeConnectedComponent = connect(MyAwesomeConnectedComponent, {
  someAction: 'actions.someAction',
  someStateValue: 'state.someStateValue',
});
```

Now `MyAwesomeConnectedComponent` will receive all props passed down from the parent,
and inject those requested from the state

### State

#### Defining state

The initial state is defined upon creation of the state instance. The object
passed during creation of this instance is used as the starting state.

#### Updating state

The global state can be updated by calling `set` with the object path and value
you would like to set it to:

```javascript
import { state } from './state';
state.set('foo', 'foo');                    // sets the key 'foo' to the value 'foo'
state.set('bar', {});                       // sets the key 'bar' to an empty object
state.set('bar.foo', 'bar');                // sets the key 'foo' of the object 'bar' to 'bar'
state.set('dar.foo', 'bar');                // does nothing because the key 'dar' does not exist
```

### Actions

#### Defining actions

Available actions are defined up creation of the actions instance. The object
passed during creation is used to define the actions available.

#### Running actions

You can run actions via the `run` function, passing the path of the action you
want to run, along with any params you want to pass, and a callback if desired:

```javascript
import { actions } from './state';
actions.call();                             // passes no parameters, nor uses a callback
actions.call('foo', 'foo');                 // passes 'foo' as a parameter, does not use a callback
```
