'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindActionFunctions = bindActionFunctions;
exports.default = createStore;

var _cast = require('../internal/cast');

var _cast2 = _interopRequireDefault(_cast);

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _StateWithSideEffects = require('./StateWithSideEffects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _bindActionFunctionToAppDispatcher(actionFunction) {

  return function (AppDispatcher) {
    return function () {
      return AppDispatcher.emit(_extends({}, actionFunction.apply(undefined, arguments)));
    };
  };
}

/**
 * Returns a function that binds the action functions to the app dispatcher.
 * This way AppDispatcher isn't a hard-coded dependency.
 *
 * @param ActionFunctions
 * @returns {Function}
 * @private
 */
function bindActionFunctions(Actions, ActionFunctions) {

  return function (AppDispatcher) {
    return Object.keys(Actions).reduce(function (storeActions, action) {
      return _extends({}, storeActions, _defineProperty({}, action, _bindActionFunctionToAppDispatcher(ActionFunctions[action])(AppDispatcher)));
    }, {});
  };
}

/**
 * Returns a function that binds the action observables to the store observable.
 * Action observables can give you a fine grain view of a store's state.
 *
 * You always have the storeObservable which is the top-level state view of the entire store.
 *
 * @param ActionObservables
 * @returns {*}
 * @private
 */
function _bindActionObservables(ActionObservables) {

  return function (storeObservable) {
    return Object.keys(ActionObservables).reduce(function (total, observable) {
      return Object.assign(total, _defineProperty({}, observable, ActionObservables[observable](storeObservable)));
    }, {});
  };
}

/**
 * Returns a function that binds the AppDispatcher to the store observable.
 *
 * The store observable is made from the channel Reducers.
 * When an action comes in, it will call the corresponding reducer with the payload.
 *
 * Note: in order for this to work, every Action must have a Reducer of the same name
 *
 * @param channel
 * @param Actions
 * @param Reducers
 * @returns {Function}
 */
function _bindStoreObservable(channel, Reducers) {

  var initialState = new _StateWithSideEffects.StateWithSideEffects(Reducers.initialState || {});

  return function (AppDispatcher) {
    return AppDispatcher.filter(function (x) {
      return x.channel === channel;
    }).scan(function (state, action) {

      var handler = Reducers[action.actionType];

      if (!handler) {
        throw new Error('Channel ' + channel + ' does not support ' + action.actionType);
      }

      var result = function result(payload) {
        return AppDispatcher.emit({ channel: channel, actionType: action.actionType + 'Result', payload: payload });
      };

      // always return a StateWithSideEffects
      return (0, _cast2.default)(handler(state, action.payload, result), _StateWithSideEffects.StateWithSideEffects);
    }, initialState).skip(1);
  };
}

function _bindResultObservables(channel, Actions) {

  return function (AppDispatcher) {
    return Object.keys(Actions).reduce(function (observables, action) {
      return Object.assign(observables, _defineProperty({}, action + 'ResultObservable', AppDispatcher.filter(function (x) {
        return x.channel === channel && x.actionType === action + 'Result';
      })));
    }, {});
  };
}

/**
 * The "store" is just the public interface used by the app. It consists of:
 *
 * - action functions (ex: DocActions) - this is what you call to initiate a store update
 * - action observables (optional) (ex: DocActionObservables) - this is how you know the store update completed.
 * - store observable - the store state
 *
 * **In order for this to work, every action function and action observable must be globally unique.**
 *
 * This isn't hard to achieve as long as you:
 * 1. use the storeStateName in the action/observable. Ex: createDoc
 * 2. use the word "observable" in the observables. Ex: docObservable
 *
 * @param storeName
 * @param channel
 * @param Actions
 * @param Reducers
 * @param ActionFunctions
 * @param ActionObservables (optional) - you always get one for free... the observable that listens to the entire store
 * @returns {{}}
 */
function createStore(channel, _ref) {
  var Actions = _ref.Actions;
  var Reducers = _ref.Reducers;
  var ActionFunctions = _ref.ActionFunctions;
  var ActionObservables = _ref.ActionObservables;


  ActionObservables = ActionObservables || {};

  (0, _assert2.default)(typeof channel === 'string', 'Needs a channel and it needs to be a string');
  (0, _assert2.default)(Actions, 'Need Actions');
  (0, _assert2.default)(Reducers, 'Need Reducers');
  (0, _assert2.default)(ActionFunctions, 'Need action functions');

  //every action must have an action function and a reducer
  Object.keys(Actions).forEach(function (action) {
    (0, _assert2.default)(ActionFunctions[action], 'Channel ' + channel + ' is missing action function "' + action + '"');
    (0, _assert2.default)(Reducers[action], 'Channel ' + channel + ' is missing reducer "' + action + '"');
  });

  //need an initial state; otherwise defaults to {}
  if (!Reducers.initialState) {
    console.warn('Channel ' + channel + ' doesn\'t have initialState');
  }

  return function (AppDispatcher) {

    var storeWithSideEffectsObservable = _bindStoreObservable(channel, Reducers)(AppDispatcher);
    var storeObservable = storeWithSideEffectsObservable.map(function (x) {
      return x.state;
    });

    return {
      name: channel,
      observable: storeWithSideEffectsObservable,
      store: _extends({}, bindActionFunctions(Actions, ActionFunctions)(AppDispatcher), _bindActionObservables(ActionObservables)(storeObservable), _bindResultObservables(channel, Actions)(AppDispatcher), _defineProperty({}, channel + 'Observable', storeObservable))
    };
  };
}
//# sourceMappingURL=createStore.js.map
