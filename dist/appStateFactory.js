'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._sagaInfo = exports._storeInfo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = appStateFactory;
exports.registerSagas = registerSagas;
exports.create = create;

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

var AppState = {};

var _storeInfo = exports._storeInfo = [];
var _sagaInfo = exports._sagaInfo = [];

function appStateFactory() {
  var middleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var AppState = {};
  var stores = [];
  var sagaInfo = [];
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
    registerStore: registerStore({ AppState: AppState, stores: stores, AppDispatcher: AppDispatcher }),
    create: create({ AppState: AppState, stores: stores, AppDispatcher: AppDispatcher }),

    get stores() {
      return stores;
    },
    get sagas() {
      return sagaInfo;
    }
  };
}

function registerStore(_ref) {
  var AppState = _ref.AppState,
      stores = _ref.stores,
      AppDispatcher = _ref.AppDispatcher;

  return function _registerStore(channel, _ref2) {
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

function registerSagas(channel, _ref3) {
  var Sagas = _ref3.Sagas,
      SagaActionFunctions = _ref3.SagaActionFunctions,
      SagaHandlers = _ref3.SagaHandlers;


  var sagas = (0, _createSagas2.default)(channel, { Sagas: Sagas, SagaActionFunctions: SagaActionFunctions, SagaHandlers: SagaHandlers })(AppDispatcher);

  // store
  _sagaInfo.push(sagas);

  // add action functions and result observables to app state
  Object.assign(AppState, sagas.actionFunctions, sagas.resultObservables);

  // setup one-way data flow
  var callback = function callback() {
    return undefined;
  };

  Object.keys(sagas.observables).forEach(function (obs) {
    return sagas.observables[obs].onValue(callback);
  });
}

function create(_ref4) {
  var AppState = _ref4.AppState,
      stores = _ref4.stores,
      AppDispatcher = _ref4.AppDispatcher;

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
