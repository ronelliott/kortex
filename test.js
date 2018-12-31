const expect = require("expect.js");
const sinon = require("sinon");
const React = require("react");
const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
Enzyme.configure({ adapter: new Adapter() });

const kortex = require("./index");

describe("kortex", function() {
	describe("action", function() {
		it("should create an action generator", function() {
			let spy = sinon.spy();
			kortex.actions.action_create_gen_foo = spy;
			kortex.action("action_create_gen_foo")();
			expect(spy.called).to.be(true);
		});

		it("should call the action with the given params", function() {
			let spy = sinon.spy(({ params }) => expect(params).to.equal("foo"));
			kortex.actions.action_create_gen_foo = spy;
			kortex.action("action_create_gen_foo")("foo");
			expect(spy.called).to.be(true);
		});

		it("should return the value returned by the action", function() {
			let spy = sinon.spy(() => "foo");
			kortex.actions.action_create_gen_foo = spy;
			const value = kortex.action("action_create_gen_foo")();
			expect(spy.called).to.be(true);
			expect(value).to.equal("foo");
		});
	});

	describe("connect", function() {
		it("should subscribe to updates for interested keys when mounting", function() {
			let oldOn = kortex.updates.on;
			kortex.updates.on = sinon.spy(oldOn);
			Enzyme.shallow(React.createElement(kortex.connect({
				"foo": "state.connect_subscribe_mount_foo",
				"bar": "state.connect_subscribe_mount_bar",
			}, sinon.spy())));
			expect(kortex.updates.on.called).to.be(true);
			expect(kortex.updates.on.calledWith("state.connect_subscribe_mount_foo")).to.be(true);
			expect(kortex.updates.on.calledWith("state.connect_subscribe_mount_bar")).to.be(true);
			kortex.updates.on = oldOn;
		});

		it("should unsubscribe from updates for interested keys when unmounting", function() {
			let oldRemoveListener = kortex.updates.removeListener;
			kortex.updates.removeListener = sinon.spy(oldRemoveListener);
			Enzyme.shallow(React.createElement(kortex.connect({
				"foo": "state.connect_unsubscribe_unmount_foo",
				"bar": "state.connect_unsubscribe_unmount_bar",
			}, sinon.spy()))).unmount();;
			expect(kortex.updates.removeListener.called).to.be(true);
			expect(kortex.updates.removeListener.calledWith("state.connect_unsubscribe_unmount_foo")).to.be(true);
			expect(kortex.updates.removeListener.calledWith("state.connect_unsubscribe_unmount_bar")).to.be(true);
			kortex.updates.removeListener = oldRemoveListener;
		});
	});

	describe("filter", function() {
		it("should filter values into an existing key", function() {
			kortex.set("filter_existing_key", ["foo", "foo", "dar"]);
			kortex.filter("filter_existing_key", value => value != "dar");
			expect(kortex.get("filter_existing_key")).to.eql(["foo", "foo"]);
		});

		it("should filter values into an non-existing key", function() {
			expect(kortex.get("filter_nonexisting_key")).to.eql(undefined);
			kortex.filter("filter_nonexisting_key", value => value != "dar");
			expect(kortex.get("filter_nonexisting_key")).to.eql([]);
		});

		it("should filter values into the given key", function() {
			kortex.set("filter_existing_key", ["foo", "foo", "dar"]);
			kortex.filter("filter_existing_key", "filter_given_key", value => value != "dar");
			expect(kortex.get("filter_existing_key")).to.eql(["foo", "foo", "dar"]);
			expect(kortex.get("filter_given_key")).to.eql(["foo", "foo"]);
		});

		it("should not filter into non-array values", function() {
			kortex.set("filter_non_array_value", "foo");
			kortex.filter("filter_non_array_value", value => value != "dar");
			expect(kortex.get("filter_non_array_value")).to.equal("foo");
		});
	});

	describe("get", function() {
		it("should work correctly", function() {
			expect(kortex.get("get_work_correctly_foo")).to.be(undefined);
			kortex.set("get_work_correctly_foo", "foo");
			expect(kortex.get("get_work_correctly_foo")).to.be("foo");
		});
	});

	describe("map", function() {
		it("should map values into an existing key", function() {
			kortex.set("map_existing_key", ["foo", "foo", "dar"]);
			kortex.map("map_existing_key", value => value + value);
			expect(kortex.get("map_existing_key")).to.eql(["foofoo", "foofoo", "dardar"]);
		});

		it("should map values into an non-existing key", function() {
			expect(kortex.get("map_nonexisting_key")).to.eql(undefined);
			kortex.map("map_nonexisting_key", value => value + value);
			expect(kortex.get("map_nonexisting_key")).to.eql([]);
		});

		it("should map values into the given key", function() {
			kortex.set("map_existing_key", ["foo", "foo", "dar"]);
			kortex.map("map_existing_key", "map_given_key", value => value + value);
			expect(kortex.get("map_existing_key")).to.eql(["foo", "foo", "dar"]);
			expect(kortex.get("map_given_key")).to.eql(["foofoo", "foofoo", "dardar"]);
		});

		it("should not map into non-array values", function() {
			kortex.set("map_non_array_value", "foo");
			kortex.map("map_non_array_value", value => value + value);
			expect(kortex.get("map_non_array_value")).to.equal("foo");
		});
	});

	describe("module", function() {
		it("should not register the actions specified in the module if they do not exist", function() {
			kortex.module("module_register_actions_non_existing", {});
			expect(kortex.actions.module_register_actions_non_existing).to.be(undefined);
		});

		it("should register the actions specified in the module using the given namespace", function() {
			kortex.module("module_register_actions_existing", {
				actions: "foo",
			});
			expect(kortex.actions.module_register_actions_existing).to.be("foo");
		});

		it("should not register the state specified in the module if they do not exist", function() {
			kortex.module("module_register_state_non_existing", {});
			expect(kortex.state.module_register_state_non_existing).to.be(undefined);
		});

		it("should register the state specified in the module using the given namespace", function() {
			kortex.module("module_register_state_existing", {
				state: "foo",
			});
			expect(kortex.state.module_register_state_existing).to.be("foo");
		});
	});

	describe("modules", function() {
		it("should register all modules in the given array", function() {
			kortex.modules([
				["modules_register_all_foo", {actions: "bar", state: "foo"}],
				["modules_register_all_bar", {actions: "foo", state: "bar"}],
			]);
			expect(kortex.actions.modules_register_all_foo).to.be("bar");
			expect(kortex.actions.modules_register_all_bar).to.be("foo");
			expect(kortex.state.modules_register_all_foo).to.be("foo");
			expect(kortex.state.modules_register_all_bar).to.be("bar");
		});
	});

	describe("pop", function() {
		it("should pop from array values", function() {
			kortex.set("pop_array_value", ["foo", "bar", "dar"]);
			const value1 = kortex.pop("pop_array_value");
			const value2 = kortex.pop("pop_array_value");
			const values = kortex.get("pop_array_value");
			expect(value1).to.equal("dar");
			expect(value2).to.equal("bar");
			expect(values).to.eql(["foo"]);
		});

		it("should pop from non-existent values", function() {
			const value1 = kortex.pop("pop_nonexistent_value");
			const value2 = kortex.pop("pop_nonexistent_value");
			const values = kortex.get("pop_nonexistent_value");
			expect(value1).to.be(undefined);
			expect(value2).to.be(undefined);
			expect(values).to.eql([]);
		});

		it("should not pop from non-array values", function() {
			kortex.set("pop_non_array_value", "foo");
			const value = kortex.pop("pop_non_array_value");
			expect(kortex.get("pop_non_array_value")).to.equal("foo");
			expect(value).to.be(undefined);
		});
	});

	describe("props", function() {
		it("should return all requested keys", function() {
			kortex.set("props_all_requested_foo", "bar");
			kortex.set("props_all_requested_bar", "foo");
			expect(kortex.props({
				foo: "state.props_all_requested_foo",
				bar: "state.props_all_requested_bar",
			})).to.eql({
				foo: "bar",
				bar: "foo",
			});
		});
	});

	describe("push", function() {
		it("should push into array values", function() {
			kortex.set("push_array_value", []);
			kortex.push("push_array_value", "foo");
			kortex.push("push_array_value", "bar");
			const values = kortex.get("push_array_value");
			expect(values).to.eql(["foo", "bar"]);
		});

		it("should push into non-existent values", function() {
			kortex.push("push_nonexistent_value", "foo");
			kortex.push("push_nonexistent_value", "bar");
			const values = kortex.get("push_nonexistent_value");
			expect(values).to.eql(["foo", "bar"]);
		});

		it("should not push into non-array values", function() {
			kortex.set("push_non_array_value", "foo");
			kortex.push("push_non_array_value", "bar");
			expect(kortex.get("push_non_array_value")).to.equal("foo");
		});
	});

	describe("reduce", function() {
		it("should reduce values into an existing key", function() {
			kortex.set("reduce_existing_key", ["foo", "foo", "dar"]);
			kortex.reduce("reduce_existing_key", (all, value) => all + value);
			expect(kortex.get("reduce_existing_key")).to.equal("foofoodar");
		});

		it("should reduce values into an non-existing key", function() {
			expect(kortex.get("reduce_nonexisting_key")).to.eql(undefined);
			kortex.reduce("reduce_nonexisting_key", (all, value) => all + value);
			expect(kortex.get("reduce_nonexisting_key")).to.eql([]);
		});

		it("should reduce values into the given key", function() {
			kortex.set("reduce_existing_key", ["foo", "foo", "dar"]);
			kortex.reduce("reduce_existing_key", "reduce_given_key", (all, value) => all + value);
			expect(kortex.get("reduce_existing_key")).to.eql(["foo", "foo", "dar"]);
			expect(kortex.get("reduce_given_key")).to.eql("foofoodar");
		});

		it("should allow changing the starting value", function() {
			kortex.set("reduce_default_value_key", ["foo", "foo", "dar"]);
			kortex.reduce("reduce_default_value_key", (all, value) => {
				all[value] = value != "dar";
				return all;
			}, {});
			expect(kortex.get("reduce_default_value_key")).to.eql({
				foo: true,
				dar: false,
			});
		});

		it("should allow changing the starting value and reducing into the given key", function() {
			kortex.set("reduce_default_value_given_key", ["foo", "foo", "dar"]);
			kortex.reduce("reduce_default_value_given_key", "reduce_default_value_given_key_other", (all, value) => {
				all[value] = value != "dar";
				return all;
			}, {});
			expect(kortex.get("reduce_default_value_given_key")).to.eql(["foo", "foo", "dar"]);
			expect(kortex.get("reduce_default_value_given_key_other")).to.eql({
				foo: true,
				dar: false,
			});
		});

		it("should not reduce into non-array values", function() {
			kortex.set("reduce_non_array_value", "foo");
			kortex.reduce("reduce_non_array_value", (all, value) => all + value);
			expect(kortex.get("reduce_non_array_value")).to.equal("foo");
		});
	});

	describe("run", function() {
		it("should produce an error if the given action does not exist", function() {
			let action = "asdfasdfasdfasdfasdfasdfasdffdasfdafdafdafdafdafdasfda";
			expect(() => kortex.run(action)).to.throwException(`Unknown action "${action}" requested`);
		});

		it("should handle function actions", function() {
			let spy = sinon.spy();
			kortex.actions.run_handle_functions = spy;
			kortex.run("run_handle_functions");
			expect(spy.called).to.be(true);
		});

		it("should handle array actions", function() {
			let spy1 = sinon.spy();
			let spy2 = sinon.spy();
			kortex.actions.run_handle_arrays = [spy1, spy2];
			kortex.run("run_handle_arrays");
			expect(spy1.called).to.be.ok();
			expect(spy2.called).to.be.ok();
		});

		it("should call the action with the given params", function() {
			let spy = sinon.spy(({ params }) => expect(params).to.equal("foo"));
			kortex.actions.run_correct_params = spy;
			kortex.run("run_correct_params", "foo");
			expect(spy.called).to.be(true);
		});

		it("should handle arrays passed as names", function() {
			let spy1 = sinon.spy();
			let spy2 = sinon.spy();
			kortex.actions.run_handle_arrays_one = spy1;
			kortex.actions.run_handle_arrays_two = spy2;
			kortex.run([
				"run_handle_arrays_one",
				"run_handle_arrays_two",
			]);
			expect(spy1.called).to.be(true);
			expect(spy2.called).to.be(true);
		});

		it("should on call each action in nested array once", function() {
			let spy1 = sinon.spy();
			let spy2 = sinon.spy();
			let spy3 = sinon.spy();
			let spy4 = sinon.spy();
			kortex.actions.run_handle_arrays_one = [spy1, spy2];
			kortex.actions.run_handle_arrays_two = [spy3, spy4];
			kortex.run([
				"run_handle_arrays_one",
				"run_handle_arrays_two",
			]);
			expect(spy1.callCount).to.be(1);
			expect(spy2.callCount).to.be(1);
			expect(spy3.callCount).to.be(1);
			expect(spy4.callCount).to.be(1);
		});

		it("should return the value returned by the action", function() {
			let spy = sinon.spy(() => "foo");
			kortex.actions.run_return_values = spy;
			const value = kortex.run("run_return_values");
			expect(spy.called).to.be(true);
			expect(value).to.equal("foo");
		});
	});

	describe("set", function() {
		it("should set the given key to the given value", function() {
			kortex.set("state_do_set_foo", "bar");
			kortex.set("state_do_set_bar", "foo");
			expect(kortex.state.state_do_set_foo).to.equal("bar");
			expect(kortex.state.state_do_set_bar).to.equal("foo");
		});

		it("should emit an update event", function() {
			let spy = sinon.spy();
			kortex.updates.on("state.state_events_foo", spy);
			kortex.set("state_events_foo", "bar");
			expect(spy.called).to.be(true);
		});
	});

	describe("shift", function() {
		it("should shift from array values", function() {
			kortex.set("shift_array_value", ["foo", "bar", "dar"]);
			const value1 = kortex.shift("shift_array_value");
			const value2 = kortex.shift("shift_array_value");
			const values = kortex.get("shift_array_value");
			expect(value1).to.equal("foo");
			expect(value2).to.equal("bar");
			expect(values).to.eql(["dar"]);
		});

		it("should shift from non-existent values", function() {
			const value1 = kortex.shift("shift_nonexistent_value");
			const value2 = kortex.shift("shift_nonexistent_value");
			const values = kortex.get("shift_nonexistent_value");
			expect(value1).to.be(undefined);
			expect(value2).to.be(undefined);
			expect(values).to.eql([]);
		});

		it("should not shift from non-array values", function() {
			kortex.set("shift_non_array_value", "foo");
			const value = kortex.shift("shift_non_array_value");
			expect(kortex.get("shift_non_array_value")).to.equal("foo");
			expect(value).to.be(undefined);
		});
	});

	describe("toggle", function() {
		it("should toggle the given key", function() {
			kortex.set("state_do_toggle_foo", false);
			kortex.set("state_do_toggle_bar", true);
			expect(kortex.state.state_do_toggle_foo).to.equal(false);
			expect(kortex.state.state_do_toggle_bar).to.equal(true);
			kortex.toggle("state_do_toggle_foo");
			kortex.toggle("state_do_toggle_bar");
			expect(kortex.state.state_do_toggle_foo).to.equal(true);
			expect(kortex.state.state_do_toggle_bar).to.equal(false);
		});
	});

	describe("toggler", function() {
		it("should toggle the given key", function() {
			const foo_toggler = kortex.toggler("state_toggler_foo");
			const bar_toggler = kortex.toggler("state_toggler_bar");
			kortex.set("state_toggler_foo", false);
			kortex.set("state_toggler_bar", true);
			expect(kortex.state.state_toggler_foo).to.equal(false);
			expect(kortex.state.state_toggler_bar).to.equal(true);
			foo_toggler();
			bar_toggler();
			expect(kortex.state.state_toggler_foo).to.equal(true);
			expect(kortex.state.state_toggler_bar).to.equal(false);
		});
	});

	describe("togglerAction", function() {
		it("should toggle the given key", function() {
			const foo_toggler = kortex.togglerAction("state_toggler_action_foo");
			const bar_toggler = kortex.togglerAction("state_toggler_action_bar");
			kortex.set("state_toggler_action_foo", false);
			kortex.set("state_toggler_action_bar", true);
			expect(kortex.state.state_toggler_action_foo).to.equal(false);
			expect(kortex.state.state_toggler_action_bar).to.equal(true);
			foo_toggler({ state: kortex });
			bar_toggler({ state: kortex });
			expect(kortex.state.state_toggler_action_foo).to.equal(true);
			expect(kortex.state.state_toggler_action_bar).to.equal(false);
		});
	});

	describe("unshift", function() {
		it("should unshift into array values", function() {
			kortex.set("unshift_array_value", []);
			kortex.unshift("unshift_array_value", "foo");
			kortex.unshift("unshift_array_value", "bar");
			const values = kortex.get("unshift_array_value");
			expect(values).to.eql(["bar", "foo"]);
		});

		it("should unshift into non-existent values", function() {
			kortex.unshift("unshift_nonexistent_value", "foo");
			kortex.unshift("unshift_nonexistent_value", "bar");
			const values = kortex.get("unshift_nonexistent_value");
			expect(values).to.eql(["bar", "foo"]);
		});

		it("should not unshift into non-array values", function() {
			kortex.set("unshift_non_array_value", "foo");
			kortex.unshift("unshift_non_array_value", "bar");
			expect(kortex.get("unshift_non_array_value")).to.equal("foo");
		});
	});

	describe("updater", function() {
		it("should update the given key", function() {
			const foo_updater = kortex.updater("state_updater_action_foo");
			const bar_updater = kortex.updater("state_updater_action_bar");
			kortex.set("state_updater_action_foo", "foo");
			kortex.set("state_updater_action_bar", "bar");
			expect(kortex.state.state_updater_action_foo).to.equal("foo");
			expect(kortex.state.state_updater_action_bar).to.equal("bar");
			foo_updater("bar");
			bar_updater("foo");
			expect(kortex.state.state_updater_action_foo).to.equal("bar");
			expect(kortex.state.state_updater_action_bar).to.equal("foo");
		});
	});

	describe("updaterEvent", function() {
		it("should update the given key", function() {
			const foo_updater = kortex.updaterEvent("state_updater_event_foo");
			const bar_updater = kortex.updaterEvent("state_updater_event_bar");
			kortex.set("state_updater_event_foo", "foo");
			kortex.set("state_updater_event_bar", "bar");
			expect(kortex.state.state_updater_event_foo).to.equal("foo");
			expect(kortex.state.state_updater_event_bar).to.equal("bar");
			foo_updater({ target: { value: "bar" } });
			bar_updater({ target: { value: "foo" } });
			expect(kortex.state.state_updater_event_foo).to.equal("bar");
			expect(kortex.state.state_updater_event_bar).to.equal("foo");
		});
	});

	describe("updaterAction", function() {
		it("should update the given key", function() {
			const foo_updater = kortex.updaterAction("state_updater_action_foo");
			const bar_updater = kortex.updaterAction("state_updater_action_bar");
			kortex.set("state_updater_action_foo", "foo");
			kortex.set("state_updater_action_bar", "bar");
			expect(kortex.state.state_updater_action_foo).to.equal("foo");
			expect(kortex.state.state_updater_action_bar).to.equal("bar");
			foo_updater({ params: "bar", state: kortex });
			bar_updater({ params: "foo", state: kortex });
			expect(kortex.state.state_updater_action_foo).to.equal("bar");
			expect(kortex.state.state_updater_action_bar).to.equal("foo");
		});
	});

	describe("updaterEventAction", function() {
		it("should update the given key", function() {
			const foo_updater = kortex.updaterEventAction("state_updater_event_action_foo");
			const bar_updater = kortex.updaterEventAction("state_updater_event_action_bar");
			kortex.set("state_updater_event_action_foo", "foo");
			kortex.set("state_updater_event_action_bar", "bar");
			expect(kortex.state.state_updater_event_action_foo).to.equal("foo");
			expect(kortex.state.state_updater_event_action_bar).to.equal("bar");
			foo_updater({ params: { target: { value: "bar" } }, state: kortex });
			bar_updater({ params: { target: { value: "foo" } }, state: kortex });
			expect(kortex.state.state_updater_event_action_foo).to.equal("bar");
			expect(kortex.state.state_updater_event_action_bar).to.equal("foo");
		});
	});
})
