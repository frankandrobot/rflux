'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = appStateFactory;
exports._registerSagas = _registerSagas;
exports._create = _create;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _createAppDispatcher = require('./appdispatcher/createAppDispatcher');

var _createAppDispatcher2 = _interopRequireDefault(_createAppDispatcher);

var _createStore = require('./stores/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _createSagas = require('./stores/createSagas');

var _createSagas2 = _interopRequireDefault(_createSagas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function appStateFactory() {
  var middleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var AppState = {};
  var stores = [];
  var sagas = [];
  var AppDispatcher = (0, _createAppDispatcher2.default)();

  /* eslint-disable no-use-before-define */
  return {
    /**
     *
     * This actually creates _and_ registers a store.
     *
     * @param {String} channel
     * @param {Map<String,*>} ActionTypes - map of action types
     * @param {Map<ActionType,Function>} Reducers - map of reducers indexed by ActionType
     * @param {Map<ActionType,Function>} ActionFunctions - map of action functions indexed by
     * ActionTypes
     * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
     * that take the StoreStateObservable as input and return an observable that selects parts
     * of the state tree. **This will probably be deprecated.**
     * @function
     */
    registerStore: _registerStore({ AppState: AppState, stores: stores, AppDispatcher: AppDispatcher }),
    registerSagas: _registerSagas({ AppState: AppState }),
    create: _create({ AppState: AppState, stores: stores, AppDispatcher: AppDispatcher }),

    get stores() {
      return stores;
    },
    get sagas() {
      return sagas;
    }
  };
}

function _registerStore(_ref) {
  var AppState = _ref.AppState,
      stores = _ref.stores,
      AppDispatcher = _ref.AppDispatcher;

  return function __registerStore(channel, _ref2) {
    var ActionTypes = _ref2.ActionTypes,
        Reducers = _ref2.Reducers,
        ActionFunctions = _ref2.ActionFunctions,
        ActionObservables = _ref2.ActionObservables;


    // first create the store
    var store = (0, _createStore2.default)(channel, { ActionTypes: ActionTypes, Reducers: Reducers, ActionFunctions: ActionFunctions, ActionObservables: ActionObservables })(AppDispatcher);

    // then add store to store info collection
    stores.push(store);

    // then create the new appStateObservable
    var stateWithSideEffectsObservables = stores.map(function (x) {
      return x.stateWithSideEffectsObservable;
    });
    var appStateObservable = _kefir2.default.combine(
    // this fires when any of the store state observables change
    stateWithSideEffectsObservables,
    // this combines all the store states into a single state
    function () {
      for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
        observables[_key] = arguments[_key];
      }

      return observables.reduce(function (appStateObservable, state, i) {
        return Object.assign(appStateObservable, _defineProperty({}, '' + stores[i].name, state.state));
      }, {});
    });

    // new app state is observable + store
    Object.assign(AppState, _extends({ appStateObservable: appStateObservable }, store.store));
  };
}

function _registerSagas(_ref3) {
  var AppState = _ref3.AppState,
      sagas = _ref3.sagas,
      AppDispatcher = _ref3.AppDispatcher;

  return function __registerSagas(channel, _ref4) {
    var Sagas = _ref4.Sagas,
        SagaActionFunctions = _ref4.SagaActionFunctions,
        SagaHandlers = _ref4.SagaHandlers;


    var _sagas = (0, _createSagas2.default)(channel, { Sagas: Sagas, SagaActionFunctions: SagaActionFunctions, SagaHandlers: SagaHandlers })(AppDispatcher);

    // store
    sagas.push(_sagas);

    // add action functions and result observables to app state
    Object.assign(AppState, _sagas.actionFunctions, _sagas.resultObservables);

    // setup one-way data flow
    var callback = function callback() {
      return undefined;
    };

    Object.keys(_sagas.observables).forEach(function (obs) {
      return _sagas.observables[obs].onValue(callback);
    });
  };
}

function _create(_ref5) {
  var AppState = _ref5.AppState,
      stores = _ref5.stores,
      AppDispatcher = _ref5.AppDispatcher;

  return function __create() {
    if (stores.length === 0) {
      throw new Error('You didn\'t register any stores!');
    }

    // setup one-way data flow + side effects
    stores.map(function (store) {
      return store.stateWithSideEffectsObservable.onValue(function (state) {
        return (state.sideEffects || []).forEach(function (sideEffect) {
          return setTimeout(function () {
            return AppDispatcher.emit(sideEffect);
          }, 0);
        });
      });
    });

    return AppState;
  };
}
//# sourceMappingURL=appStateFactory.js.map
