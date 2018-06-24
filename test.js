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

	describe("get", function() {
		it("should work correctly", function() {
			expect(kortex.get("get_work_correctly_foo")).to.be(undefined);
			kortex.set("get_work_correctly_foo", "foo");
			expect(kortex.get("get_work_correctly_foo")).to.be("foo");
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
})
