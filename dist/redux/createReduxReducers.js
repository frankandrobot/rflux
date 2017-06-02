'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createReduxReducers;

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _StateWithSideEffects = require('../channels/StateWithSideEffects');

var _reduxChannelName = require('./reduxChannelName');

var _reduxChannelName2 = _interopRequireDefault(_reduxChannelName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createReduxReducerStateObservable(channel, Reducers) {

  var reducerKeys = Object.keys(Reducers);

  return function (AppDispatcher) {
    return AppDispatcher.filter(function (x) {
      return x && x.channel === channel;
    }).scan(function (state, action) {

      var newFullState = {};

      for (var i = 0; i < reducerKeys.length; i++) {
        var reducerKey = reducerKeys[i];
        var reducer = Reducers[reducerKey];
        var newState = reducer(state[reducerKey], action.payload);

        newFullState[reducerKey] = newState;
      }
      // note how this returns a normal JS object. That means "state" in this
      // stream is just a normal JS object.
      return newFullState;
    },
    // the assumption is that if you invoke the reducer with no params, you will
    // get back the initial state.
    reducerKeys.reduce(function (initialState, reducerKey) {
      return Object.assign(initialState, _defineProperty({}, reducerKey, Reducers[reducerKey](undefined, {})));
    }, {}));
  };
}

/**
 * Creates a special channel for redux reducers. The main differences between this and
 * `createChannels` are:
 *
 * 1. `createChannels` assumes a single reducer per action type. `createReduxReducers`
 *    passes all actions to *every* reducer, as per the redux style.
 * 2. `createChannels` maps each channel to a single top-level state property.
 *    `createReduxReducers` maps every reducer to a top-level state property. But
 *     internally, all messages flow through a single redux channel.
 *
 * ## Limitations
 *
 * Currently, `redux#combineReducers` is not supported.
 *
 * ## Message Dispatching
 *
 * To pass a message to a redux reducer from an rflux app, use this format:
 * - channel:String = reduxChannelName (see ./reduxChannelName)
 * - actionType:String
 * - payload: {//actual redux action }
 *
 * @param {Map<string,Function>} Reducers
 * @returns {Function} the redux reducers channel
 */
function createReduxReducers(_ref) {
  var Reducers = _ref.Reducers,
      AppDispatcher = _ref.AppDispatcher;


  (0, _assert2.default)(Reducers, 'Need Reducers');

  var combinedStateObservable = _createReduxReducerStateObservable(_reduxChannelName2.default, Reducers)(AppDispatcher);

  return Object.keys(Reducers).map(function (reducerKey) {
    var reducerStateObservable = combinedStateObservable.map(function (combinedState) {
      return combinedState[reducerKey];
    })
    // check that objects point to the same thing
    // eslint-disable-next-line eqeqeq
    .skipDuplicates(function (prev, next) {
      return prev == next;
    });

    return {
      name: reducerKey,
      stateWithSideEffectsObservable: reducerStateObservable.map(function (reducerState) {
        return (0, _StateWithSideEffects.state)(reducerState);
      }),
      observable: _defineProperty({}, reducerKey, reducerStateObservable),
      channel: {}
    };
  });
}
//# sourceMappingURL=createReduxReducers.js.map
