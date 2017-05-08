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

var _middlewareFactory = require('./redux/middlewareFactory');

var _middlewareFactory2 = _interopRequireDefault(_middlewareFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * A store consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Stores[]} stores
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 */
function appStateFactory(_ref) {
  var _ref$stores = _ref.stores,
      rawStores = _ref$stores === undefined ? [] : _ref$stores,
      _ref$sagas = _ref.sagas,
      rawSagas = _ref$sagas === undefined ? [] : _ref$sagas,
      _ref$middleware = _ref.middleware,
      middleware = _ref$middleware === undefined ? [] : _ref$middleware;


  /* eslint-disable no-use-before-define */
  if (rawStores.length === 0) {
    throw new Error('You didn\'t add any stores!');
  }
  var InitialAppDispatcher = (0, _createAppDispatcher2.default)();
  var dispatch = function dispatch() {
    return InitialAppDispatcher.emit.apply(InitialAppDispatcher, arguments);
  };
  var Middleware = (0, _middlewareFactory2.default)({ dispatch: dispatch, rawMiddleware: middleware });
  var AppDispatcher = Middleware.attachMiddleware({ AppDispatcher: InitialAppDispatcher });

  var stores = _createStores({ rawStores: rawStores, AppDispatcher: AppDispatcher });
  var sagas = _createSagas({ rawSagas: rawSagas, AppDispatcher: AppDispatcher });
  var appStateObservable = _createAppStateObservable({ stores: stores })
  // inject the state back into Middleware, so that getState works. Unfortunately, in kefirjs, there is
  // no way to do a side effect w/o activating the stream. So we use `map` for side effects (which is
  // technically an antipattern).
  .map(function (state) {
    Middleware.setState(state);return state;
  });

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
      AppDispatcher = _ref2.AppDispatcher;

  return rawStores.map(function (s) {
    return (0, _createStore2.default)(s)(AppDispatcher);
  });
}

function _createSagas(_ref3) {
  var rawSagas = _ref3.rawSagas,
      AppDispatcher = _ref3.AppDispatcher;

  return rawSagas.map(function (s) {
    return (0, _createSagas3.default)(s)(AppDispatcher);
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
