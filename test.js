const expect = require("expect.js");
const sinon = require("sinon");
const React = require("react");
const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
Enzyme.configure({ adapter: new Adapter() });

const state = require("./index");

describe("kortex", function() {
	describe("action", function() {
		it("should create an action generator", function() {
			let spy = sinon.spy();
			state.actions.action_create_gen_foo = spy;
			state.action("action_create_gen_foo")();
			expect(spy.called).to.be(true);
		});

		it("should call the action with the given params", function() {
			let spy = sinon.spy(({ params }) => expect(params).to.equal("foo"));
			state.actions.action_create_gen_foo = spy;
			state.action("action_create_gen_foo")("foo");
			expect(spy.called).to.be(true);
		});
	});

	describe("connect", function() {
		it("should subscribe to updates for interested keys when mounting", function() {
			let oldOn = state.updates.on;
			state.updates.on = sinon.spy(oldOn);
			Enzyme.shallow(React.createElement(state.connect({
				"foo": "connect_subscribe_mount_foo",
				"bar": "connect_subscribe_mount_bar",
			}, sinon.spy())));
			expect(state.updates.on.called).to.be(true);
			expect(state.updates.on.calledWith("connect_subscribe_mount_foo")).to.be(true);
			expect(state.updates.on.calledWith("connect_subscribe_mount_bar")).to.be(true);
			state.updates.on = oldOn;
		});

		it("should unsubscribe from updates for interested keys when unmounting", function() {
			let oldRemoveListener = state.updates.removeListener;
			state.updates.removeListener = sinon.spy(oldRemoveListener);
			Enzyme.shallow(React.createElement(state.connect({
				"foo": "connect_unsubscribe_unmount_foo",
				"bar": "connect_unsubscribe_unmount_bar",
			}, sinon.spy()))).unmount();;
			expect(state.updates.removeListener.called).to.be(true);
			expect(state.updates.removeListener.calledWith("connect_unsubscribe_unmount_foo")).to.be(true);
			expect(state.updates.removeListener.calledWith("connect_unsubscribe_unmount_bar")).to.be(true);
			state.updates.removeListener = oldRemoveListener;
		});
	});

	describe("module", function() {
		it("should not register the actions specified in the module if they do not exist", function() {
			state.module("module_register_actions_non_existing", {});
			expect(state.actions.module_register_actions_non_existing).to.be(undefined);
		});

		it("should register the actions specified in the module using the given namespace", function() {
			state.module("module_register_actions_existing", {
				actions: "foo",
			});
			expect(state.actions.module_register_actions_existing).to.be("foo");
		});

		it("should not register the state specified in the module if they do not exist", function() {
			state.module("module_register_state_non_existing", {});
			expect(state.state.module_register_state_non_existing).to.be(undefined);
		});

		it("should register the state specified in the module using the given namespace", function() {
			state.module("module_register_state_existing", {
				state: "foo",
			});
			expect(state.state.module_register_state_existing).to.be("foo");
		});
	});

	describe("modules", function() {
		it("should register all modules in the given array", function() {
			state.modules([
				["modules_register_all_foo", {actions: "bar", state: "foo"}],
				["modules_register_all_bar", {actions: "foo", state: "bar"}],
			]);
			expect(state.actions.modules_register_all_foo).to.be("bar");
			expect(state.actions.modules_register_all_bar).to.be("foo");
			expect(state.state.modules_register_all_foo).to.be("foo");
			expect(state.state.modules_register_all_bar).to.be("bar");
		});
	});

	describe("props", function() {
		it("should return all requested keys", function() {
			state.set("props_all_requested_foo", "bar");
			state.set("props_all_requested_bar", "foo");
			expect(state.props({
				foo: "props_all_requested_foo",
				bar: "props_all_requested_bar",
			})).to.eql({
				foo: "bar",
				bar: "foo",
			});
		});
	});

	describe("run", function() {
		it("should produce an error if the given action does not exist", function(done) {
			let action = "asdfasdfasdfasdfasdfasdfasdffdasfdafdafdafdafdafdasfda";
			state.run(action, err => {
				expect(err).to.be(`Unknown action "${action}" requested`);
				done();
			});
		});

		it("should handle function actions", function() {
			let spy = sinon.spy();
			state.actions.run_handle_functions = spy;
			state.run("run_handle_functions");
			expect(spy.called).to.be(true);
		});

		it("should handle array actions", function() {
			let spy1 = sinon.spy((params, next) => next());
			let spy2 = sinon.spy((params, next) => next());
			state.actions.run_handle_arrays = [spy1, spy2];
			state.run("run_handle_arrays");
			expect(spy1.called).to.be.ok();
			expect(spy2.called).to.be.ok();
		});

		it("should call the action with the given params", function() {
			let spy = sinon.spy(({ params }) => {
				expect(params).to.equal("foo");
			});
			state.actions.run_correct_params = spy;
			state.run("run_correct_params", "foo");
			expect(spy.called).to.be(true);
		});
	});

	describe("set", function() {
		it("should set the given key to the given value", function() {
			state.set("state_do_set_foo", "bar");
			state.set("state_do_set_bar", "foo");
			expect(state.state.state_do_set_foo).to.equal("bar");
			expect(state.state.state_do_set_bar).to.equal("foo");
		});

		it("should emit an update event", function() {
			let spy = sinon.spy();
			state.updates.on("state_events_foo", spy);
			state.set("state_events_foo", "bar");
			expect(spy.called).to.be(true);
		});
	});
})
