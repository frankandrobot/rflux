'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._sagaInfo = exports._storeInfo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerStore = registerStore;
exports.registerSagas = registerSagas;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _AppDispatcher = require('./appdispatcher/AppDispatcher');

var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);

var _createStore = require('./stores/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _createSagas = require('./stores/createSagas');

var _createSagas2 = _interopRequireDefault(_createSagas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppState = {};

var _storeInfo = exports._storeInfo = [];
var _sagaInfo = exports._sagaInfo = [];

/**
 * This actually creates _and_ registers a store.
 *
 * @param {String} channel
 * @param {Map<String,*>} Actions - map of action types
 * @param {Map<Action,Function>} Reducers - map of reducers indexed by Action
 * @param {Map<Action,Function>} ActionFunctions - map of action functions indexed by
 * Actions
 * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
 * that take the StoreObservable as input and return an observable that selects parts
 * of the state tree. **This will probably be deprecated.**
 */
function registerStore(channel, _ref) {
  var Actions = _ref.Actions,
      Reducers = _ref.Reducers,
      ActionFunctions = _ref.ActionFunctions,
      ActionObservables = _ref.ActionObservables;


  var store = (0, _createStore2.default)(channel, { Actions: Actions, Reducers: Reducers, ActionFunctions: ActionFunctions, ActionObservables: ActionObservables })(_AppDispatcher2.default);

  // add store to store info collection
  _storeInfo.push(store);

  // update app state observable with latest
  var storeStateObservables = _storeInfo.map(function (x) {
    return x.observable;
  });
  var appStateObservable = _kefir2.default.combine(
  // this fires when any of the store state observables change
  storeStateObservables,
  // this combines all the store states into a single state
  function () {
    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
      observables[_key] = arguments[_key];
    }

    return observables.reduce(function (appStateObservable, storeState, i) {
      return Object.assign(appStateObservable, _defineProperty({}, '' + _storeInfo[i].name, storeState.state));
    }, {});
  });

  Object.assign(AppState, { appStateObservable: appStateObservable });

  // add store to AppState
  Object.assign(AppState, _extends({}, store.store));

  // setup one-way data flow + side effects
  store.observable.onValue(function (state) {
    return (state.sideEffects || []).forEach(function (sideEffect) {
      return setTimeout(function () {
        return _AppDispatcher2.default.emit(sideEffect);
      }, 0);
    });
  });
}

function registerSagas(channel, _ref2) {
  var Sagas = _ref2.Sagas,
      SagaActionFunctions = _ref2.SagaActionFunctions,
      SagaHandlers = _ref2.SagaHandlers;


  var sagas = (0, _createSagas2.default)(channel, { Sagas: Sagas, SagaActionFunctions: SagaActionFunctions, SagaHandlers: SagaHandlers })(_AppDispatcher2.default);

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

exports.default = AppState;
//# sourceMappingURL=AppState.js.map
