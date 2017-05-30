'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = appStateFactory;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _checkUnique = require('./internal/checkUnique');

var _checkUnique2 = _interopRequireDefault(_checkUnique);

var _createAppDispatcher = require('./appdispatcher/createAppDispatcher');

var _createAppDispatcher2 = _interopRequireDefault(_createAppDispatcher);

var _createChannels = require('./channels/createChannels');

var _createChannels2 = _interopRequireDefault(_createChannels);

var _createSagas = require('./channels/createSagas');

var _createSagas2 = _interopRequireDefault(_createSagas);

var _sagaInterfaceFactory = require('./channels/sagaInterfaceFactory');

var _sagaInterfaceFactory2 = _interopRequireDefault(_sagaInterfaceFactory);

var _reduxMiddlewareFactory = require('./redux/reduxMiddlewareFactory');

var _reduxMiddlewareFactory2 = _interopRequireDefault(_reduxMiddlewareFactory);

var _createReduxReducers = require('./redux/createReduxReducers');

var _createReduxReducers2 = _interopRequireDefault(_createReduxReducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * A channel consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * See `createChannels` for more details.
 *
 * A saga consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - SagaHandlersFn higher order function that accepts a `sagas` interface and
 *   returns the SagaHandlers.
 *
 * See `createSagas` for more details.
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Channels[]} channels
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 * @returns {{AppState, AppDispatcher}} the AppState and its dispatcher to send messages.
 */
function appStateFactory(_ref) {
  var _ref$channels = _ref.channels,
      rawChannels = _ref$channels === undefined ? [] : _ref$channels,
      _ref$sagas = _ref.sagas,
      rawSagas = _ref$sagas === undefined ? [] : _ref$sagas,
      _ref$redux = _ref.redux;
  _ref$redux = _ref$redux === undefined ? { redux: { middleware: [], reducers: {} } } : _ref$redux;
  var _ref$redux$middleware = _ref$redux.middleware,
      middleware = _ref$redux$middleware === undefined ? [] : _ref$redux$middleware,
      _ref$redux$reducers = _ref$redux.reducers,
      reducers = _ref$redux$reducers === undefined ? {} : _ref$redux$reducers;


  /* eslint-disable no-use-before-define */
  // setup redux
  var Middleware = (0, _reduxMiddlewareFactory2.default)({
    AppDispatcher: (0, _createAppDispatcher2.default)(),
    rawMiddleware: middleware
  });
  var AppDispatcher = Middleware.appDispatcher();

  // setup public interface
  var reduxStore = (0, _createReduxReducers2.default)({ Reducers: reducers, AppDispatcher: AppDispatcher });
  var channels = (0, _createChannels2.default)({ rawChannels: rawChannels, AppDispatcher: AppDispatcher });
  var appStateObservable = _createAppStateObservable({ channels: [].concat(_toConsumableArray(channels), _toConsumableArray(reduxStore)) })
  // inject the state back into Middleware, so that getState works. Unfortunately,
  // in kefirjs, there is no way to do a side effect w/o activating the stream. So
  // we use `map` for side effects (which is technically an antipattern).
  .map(function (state) {
    Middleware.setState(state);
    return state;
  });
  var sagaInterface = (0, _sagaInterfaceFactory2.default)({ AppDispatcher: AppDispatcher, appStateObservable: appStateObservable });
  var sagas = (0, _createSagas2.default)({ rawSagas: rawSagas, AppDispatcher: AppDispatcher, sagaInterface: sagaInterface });

  (0, _checkUnique2.default)([].concat(_toConsumableArray(rawChannels), _toConsumableArray(rawSagas), _toConsumableArray(reducers)), 'channel', 'Cannot have a channel, saga, or redux reducer with the same name');

  _setupChannelObs({ channels: [].concat(_toConsumableArray(channels), _toConsumableArray(reduxStore)), AppDispatcher: AppDispatcher });
  _setupSagaObs({ sagas: sagas });

  var AppState = _extends({
    appStateObservable: appStateObservable,
    // the pre-bound actions
    actions: _extends({}, _channelActions([].concat(_toConsumableArray(channels), _toConsumableArray(reduxStore))), _sagaActions(sagas)),
    observables: _extends({}, _channelObservables([].concat(_toConsumableArray(channels), _toConsumableArray(reduxStore))), _sagaObservables(sagas))
  }, _channelsToState({ channels: [].concat(_toConsumableArray(channels), _toConsumableArray(reduxStore)) }));
  /* eslint-enable */

  return {
    AppState: AppState,
    AppDispatcher: AppDispatcher
  };
}

function _createAppStateObservable(_ref2) {
  var channels = _ref2.channels;

  // first create the new appStateObservable
  var channelStatesWithSideEffectsObservables = channels.map(function (x) {
    return x.stateWithSideEffectsObservable;
  });

  // then combine these into the appStateObservable
  return _kefir2.default.combine(
  // this fires when any of the channel state observables change
  channelStatesWithSideEffectsObservables,
  // this combines all the channel states into a single state
  function () {
    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
      observables[_key] = arguments[_key];
    }

    return observables.reduce(function (appStateObservable, state, i) {
      return Object.assign(appStateObservable, _defineProperty({}, '' + channels[i].name, state.state));
    }, {});
  });
}

function _channelActions(channels) {
  return channels.reduce(function (state, channel) {
    return _extends({}, state, channel.actions);
  }, {});
}

function _sagaActions(sagas) {
  return sagas.reduce(function (state, saga) {
    return _extends({}, state, saga.actionFunctions);
  }, {});
}

function _channelObservables(channels) {
  return channels.reduce(function (state, channel) {
    return _extends({}, state, channel.observable);
  }, {});
}

function _sagaObservables(sagas) {
  return sagas.reduce(function (state, saga) {
    return _extends({}, state, saga.resultObservables);
  }, {});
}

/**
 * @deprecated
 * @param channels
 * @returns {*}
 * @private
 */
function _channelsToState(_ref3) {
  var channels = _ref3.channels;

  return channels.reduce(function (state, channel) {
    return _extends({}, state, channel.channel);
  }, {});
}

function _setupChannelObs(_ref4) {
  var channels = _ref4.channels,
      AppDispatcher = _ref4.AppDispatcher;

  // setup one-way data flow + side effects
  channels.forEach(function (channel) {
    return channel.stateWithSideEffectsObservable.onValue(function (state) {
      return (state.sideEffects || []).forEach(function (sideEffect) {
        return setTimeout(function () {
          return AppDispatcher.emit(sideEffect);
        }, 0);
      });
    });
  });
}

function _setupSagaObs(_ref5) {
  var sagas = _ref5.sagas;

  // setup one-way data flow
  sagas.forEach(function (_sagas) {
    return Object.keys(_sagas.observables).forEach(function (obs) {
      return _sagas.observables[obs].onValue(function () {
        return undefined;
      });
    });
  });
}
//# sourceMappingURL=appStateFactory.js.map
