# kortex

[![Build Status](https://travis-ci.org/ronelliott/kortex.svg?branch=master)](https://travis-ci.org/ronelliott/kortex)
[![Coverage Status](https://coveralls.io/repos/github/ronelliott/kortex/badge.svg?branch=master)](https://coveralls.io/github/ronelliott/kortex?branch=master)

Dead simple state management for react.

## Installation

    $ npm install kortex

## Usage

### Connecting

Connecting a component to the global state should feel familiar, simply call
`connect`, passing an object mapping your component's interested keys (more later)
to the expected prop name, like so:

```javascript
import MyAwesomeComponent from "./components/MyAwesomeComponent";
import { connect } from "kortex";
const MyAwesomeConnectedComponent = connect(MyAwesomeConnectedComponent);
```

Now `MyAwesomeConnectedComponent` will receive all props passed down from the parent,
and inject those requested from the state


### Updating state

The global state can be updated by calling `set` with the object path and value
you would like to set it to:

```javascript
import { state } from "kortex";
state.set("foo", "foo");                    // sets the key "foo" to the value "foo"
state.set("bar", {});                       // sets the key "bar" to an empty object
state.set("bar.foo", "bar");                // sets the key "foo" of the object "bar" to "bar"
state.set("dar.foo", "bar");                // does nothing because the key "dar" does not exist
```

### Running actions

You can run actions via the `run` function, passing the path of the action you
want to run, along with any params you want to pass, and a callback if desired:

```javascript
import { run } from "kortex";
run.set("foo");                             // passes no parameters, nor uses a callback
run.set("foo", "foo");                      // passes "foo" as a parameter, does not use a callback
run.set("foo.bar", "foo", err => {          // passes "foo" as a parameter and uses a callback
  if (err) console.error(err);
});
run.set("foo.bar", "foo", "bar", err => {   // explodes, only pass one param
  if (err) console.error(err);
});
```

### Modules

You can split your actions/states up between different "modules" and add them
to the global state using the `module` or `modules` function:

```javascript
const foo = require('./foo');
const bar = require('./bar');
import { module as mod, modules } from "kortex";
mod("foo", foo);                            // registers a module under the "foo" namespace
modules([                                   // registers two modules, one under the "foo" namespace, one under the "bar" namespace
  ["foo", foo],
  ["bar", bar],
])
```

Modules are just objects with 2 expected keys, "actions" and "state". Neither key
is required, however if the "action" key is provided all children will be added
to the global state. This is also true with the "state" key.
