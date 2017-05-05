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

var _StateWithSideEffects2 = _interopRequireDefault(_StateWithSideEffects);

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
 * Takes a map of ActionFunctions indexed by Action and binds each to the
 * AppDispatcher. That is, when a bound function is called, it automatically
 * dispatches its message to the store.
 *
 * TODO global rename Action => ActionType
 *
 * **Note:**
 * 1. This method is actually a higher order function. It returns a function
 *    that accepts the AppDispatcher object as a parameter. This way, the
 *    AppDispatcher is not hard-coded dependency.
 *
 * @param {Map<String,Boolean>} Actions
 * @param {Map<Action,Function>} ActionFunctions
 * @returns {Function} a function that binds the action functions to the app dispatcher
 */
function bindActionFunctions(Actions, ActionFunctions) {

  return function (AppDispatcher) {
    return Object.keys(Actions).reduce(function (storeActions, action) {
      return _extends({}, storeActions, _defineProperty({}, action, _bindActionFunctionToAppDispatcher(ActionFunctions[action])(AppDispatcher)));
    }, {});
  };
}

/**
 * @deprecated You rarely (really) need a *pre-bound* selector (emphasis:
 * "pre-bound"). For this reason, these are deprecated.
 *
 * Takes a map of ActionObservables *not necessarily indexed by Action* and binds each
 * to the StoreObservable. The StoreObservable is the store's state, wrapped in a
 * Kefir stream (otherwise known as an *observable*).
 *
 * Since the StoreObservable represents the state, an ActionObservable is a way of
 * observing (aka "selecting") arbitrary parts of the state tree.
 *
 * **Note:**
 * 1. This method is actually a higher order function. It returns a function
 *    that accepts a StoreObservable object as a parameter. This way, the
 *    StoreObservable is not hard-coded dependency.
 *
 * TODO global rename StoreObservable => StateObservable
 * TODO global rename ActionObservable => SelectionObservable
 *
 * @param {Map<String,Observable>} ActionObservables
 * @returns {Function} a function that binds the action observables to the store observable
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
 * Creates the store's state observable using the given channel name.
 *
 * When an action comes in, it will call the corresponding reducer with the payload,
 * and pass the new state to the observable.
 *
 * Every reducer is called with these parameters:
 * 1. the current state
 * 2. the action payload
 * 3. a `endOfSideEffects` function that can be used to report the end of all the
 * side effects.
 *
 * In addition to updating the state, every reducer can also dispatch side
 * effects---which are just messages that are handled by other reducers or sagas. By
 * using the result of the `endOfSideEffects` function as the last side effect, it is
 * possible to tell when the entire reducer workflow completes... or so that's the
 * idea.
 *
 * Each reducer has this signature:
 *
 * ```
 * (state:StoreState, payload:Payload, endOfSideEffects:Payload => Message)
 * => StateWithSideEffects
 * ```
 *
 * TODO sideEffectResult may not actually fire correctly, specially when side effects
 * are handled by async sagas.
 *
 * **Notes:**
 * 1. Every Action must have a corresponding Reducer.
 * 2. This method is actually a higher order function. It returns a function
 *    that accepts an AppDispatcher object as a parameter. This way, the
 *    AppDispatcher is not hard-coded dependency.
 *
 * @param {String} channel
 * @param {Map<Action,Function>} Reducers
 * @returns {Function} a function that creates the store's state observable.
 */
function _createStoreObservable(channel, Reducers) {

  var initialState = new _StateWithSideEffects2.default(Reducers.initialState || {});

  return function (AppDispatcher) {
    return AppDispatcher.filter(function (x) {
      return x.channel === channel;
    }).scan(function (stateWithSideEffects, action) {

      var reducer = Reducers[action.actionType];

      if (!reducer) {
        throw new Error('Channel ' + channel + ' does not support ' + action.actionType);
      }

      var endOfSideEffects = function endOfSideEffects(payload) {
        return {
          channel: channel + 'Result',
          actionType: action.actionType + 'Result',
          payload: payload
        };
      };

      // always return a StateWithSideEffects (code hardening)
      return (0, _cast2.default)(reducer(stateWithSideEffects.state, action.payload, endOfSideEffects), _StateWithSideEffects2.default);
    }, initialState);
  };
}

/**
 * The idea is that you can use these observables to observe the end of a reducer +
 * side effects.
 * @param {String} channel
 * @param {Map<String,*>} Actions
 * @returns {Function} function that binds AppDispatcher to the observables
 * @private
 */
function _createEndOfActionsObservables(channel, Actions) {

  return function (AppDispatcher) {
    return Object.keys(Actions).reduce(function (observables, action) {
      return Object.assign(observables, _defineProperty({}, action + 'ResultObservable', AppDispatcher.filter(function (x) {
        return x.channel === channel + 'Result' && x.actionType === action + 'Result';
      }).map(function (x) {
        return x.payload;
      })));
    }, {});
  };
}

/* eslint-disable no-console */
/**
 * The store consists of
 * - the channel name
 * - the state observable
 * - bound (aka "live") action functions
 * - bound state selectors (which will probably be deprecated in a future release)
 *
 * It is created from a map of the ActionTypes. Each ActionType has a corresponding
 * reducer, which handles incoming messages. Each ActionType also has a corresponding
 * ActionFunction that's used to dispatch messages.
 *
 * One catch is that the *names* of the ActionFunctions and the ActionObservables must
 * be globally unique. This isn't hard to achieve as long as you:
 *
 * 1. use the channel name in the action/observable. Ex: createDoc
 * 2. use the word "observable" in the observables. Ex: docObservable
 *
 * @param {String} channel
 * @param {Map<String,*>} Actions - map of action type constants
 * @param {Map<Action,Function>} Reducers - map of reducers, indexed by Action.
 * Additionally, reducers have an `initialState` property.
 * @param {Map<Action,Function>} ActionFunctions - map of action functions, indexed by
 * Action
 * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
 * that take the StoreObservable as input and return an observable that selects parts
 * of the state tree. **This will probably be deprecated.**
 * @returns {Function} that binds the store to the app dispatcher
 */
function createStore(channel, _ref) {
  var Actions = _ref.Actions,
      Reducers = _ref.Reducers,
      ActionFunctions = _ref.ActionFunctions,
      ActionObservables = _ref.ActionObservables;


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

    var storeWithSideEffectsObservable = _createStoreObservable(channel, Reducers)(AppDispatcher);
    var storeObservable = storeWithSideEffectsObservable.map(function (x) {
      return x.state;
    });

    return {
      name: channel,
      observable: storeWithSideEffectsObservable,
      store: _extends({}, bindActionFunctions(Actions, ActionFunctions)(AppDispatcher), _bindActionObservables(ActionObservables)(storeObservable), _createEndOfActionsObservables(channel, Actions)(AppDispatcher), _defineProperty({}, channel + 'Observable', storeObservable))
    };
  };
}
//# sourceMappingURL=createStore.js.map
