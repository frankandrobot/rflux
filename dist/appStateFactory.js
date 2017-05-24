'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = appStateFactory;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _createAppDispatcher = require('./appdispatcher/createAppDispatcher');

var _createAppDispatcher2 = _interopRequireDefault(_createAppDispatcher);

var _createStore = require('./stores/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _createSagas2 = require('./stores/createSagas');

var _createSagas3 = _interopRequireDefault(_createSagas2);

var _sagaInterfaceFactory = require('./stores/sagaInterfaceFactory');

var _sagaInterfaceFactory2 = _interopRequireDefault(_sagaInterfaceFactory);

var _reduxMiddlewareFactory = require('./redux/reduxMiddlewareFactory');

var _reduxMiddlewareFactory2 = _interopRequireDefault(_reduxMiddlewareFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * A store consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * See `createStore` for more details.
 *
 * A saga consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - SagaHandlersFn higher order function that accepts a `sagas` interface and returns the SagaHandlers.
 *
 * See `createSagas` for more details.
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Stores[]} stores
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 * @returns {{AppState, AppDispatcher}} the AppState and its dispatcher to send messages.
 */
function appStateFactory(_ref) {
  var _ref$stores = _ref.stores,
      rawStores = _ref$stores === undefined ? [] : _ref$stores,
      _ref$sagas = _ref.sagas,
      rawSagas = _ref$sagas === undefined ? [] : _ref$sagas,
      _ref$redux = _ref.redux;
  _ref$redux = _ref$redux === undefined ? { redux: { middleware: [], reducers: [] } } : _ref$redux;
  var _ref$redux$middleware = _ref$redux.middleware,
      middleware = _ref$redux$middleware === undefined ? [] : _ref$redux$middleware,
      _ref$redux$reducers = _ref$redux.reducers,
      reducers = _ref$redux$reducers === undefined ? [] : _ref$redux$reducers;


  /* eslint-disable no-use-before-define */
  if (rawStores.length === 0) {
    throw new Error('You didn\'t add any stores!');
  }
  // first setup internal fixtures
  var InitialAppDispatcher = (0, _createAppDispatcher2.default)();
  var dispatch = function dispatch() {
    return InitialAppDispatcher.emit.apply(InitialAppDispatcher, arguments);
  };
  // unfortunately, you have to setup the redux middleware early in the setup process
  var Middleware = (0, _reduxMiddlewareFactory2.default)({ dispatch: dispatch, rawMiddleware: middleware });
  var AppDispatcher = Middleware.appDispatcher({ AppDispatcher: InitialAppDispatcher });
  // then setup public structures
  var stores = _createStores({ rawStores: rawStores, AppDispatcher: AppDispatcher });
  var appStateObservable = _createAppStateObservable({ stores: stores })
  // inject the state back into Middleware, so that getState works. Unfortunately, in kefirjs,
  // there is no way to do a side effect w/o activating the stream. So we use `map` for side effects
  // (which is technically an antipattern).
  .map(function (state) {
    Middleware.setState(state);
    return state;
  });
  var sagaInterface = (0, _sagaInterfaceFactory2.default)({ AppDispatcher: AppDispatcher, appStateObservable: appStateObservable });
  var sagas = _createSagas({ rawSagas: rawSagas, AppDispatcher: AppDispatcher, sagaInterface: sagaInterface });

  _setupStoreObs({ stores: stores, AppDispatcher: AppDispatcher });
  _setupSagaObs({ sagas: sagas });

  var AppState = _extends({
    appStateObservable: appStateObservable
  }, _storesToState({ stores: stores }), _sagasToState({ sagas: sagas }));

  return {
    AppState: AppState,
    AppDispatcher: AppDispatcher
  };
}

function _createStores(_ref2) {
  var rawStores = _ref2.rawStores,
      args = _objectWithoutProperties(_ref2, ['rawStores']);

  return rawStores.map(function (s) {
    return (0, _createStore2.default)(s)(_extends({}, args));
  });
}

function _createSagas(_ref3) {
  var rawSagas = _ref3.rawSagas,
      args = _objectWithoutProperties(_ref3, ['rawSagas']);

  return rawSagas.map(function (s) {
    return (0, _createSagas3.default)(s)(_extends({}, args));
  });
}

function _createAppStateObservable(_ref4) {
  var stores = _ref4.stores;

  // first create the new appStateObservable
  var storeStatesWithSideEffectsObservables = stores.map(function (x) {
    return x.stateWithSideEffectsObservable;
  });

  // then combine these into the appStateObservable
  return _kefir2.default.combine(
  // this fires when any of the store state observables change
  storeStatesWithSideEffectsObservables,
  // this combines all the store states into a single state
  function () {
    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
      observables[_key] = arguments[_key];
    }

    return observables.reduce(function (appStateObservable, state, i) {
      return Object.assign(appStateObservable, _defineProperty({}, '' + stores[i].name, state.state));
    }, {});
  });
}

function _storesToState(_ref5) {
  var stores = _ref5.stores;

  return stores.reduce(function (state, store) {
    return _extends({}, state, store.store);
  }, {});
}

function _sagasToState(_ref6) {
  var sagas = _ref6.sagas;

  // add action functions and result observables to app state
  return sagas.reduce(function (state, saga) {
    return _extends({}, state, saga.actionFunctions, saga.resultObservables);
  }, {});
}

function _setupStoreObs(_ref7) {
  var stores = _ref7.stores,
      AppDispatcher = _ref7.AppDispatcher;

  // setup one-way data flow + side effects
  stores.forEach(function (store) {
    return store.stateWithSideEffectsObservable.onValue(function (state) {
      return (state.sideEffects || []).forEach(function (sideEffect) {
        return setTimeout(function () {
          return AppDispatcher.emit(sideEffect);
        }, 0);
      });
    });
  });
}

function _setupSagaObs(_ref8) {
  var sagas = _ref8.sagas;

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
