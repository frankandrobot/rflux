'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerStore = registerStore;
exports.registerSideEffects = registerSideEffects;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _AppDispatcher = require('./AppDispatcher');

var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _createSideEffects = require('./createSideEffects');

var _createSideEffects2 = _interopRequireDefault(_createSideEffects);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppState = {};

var _storeInfo = [];
var _sideEffectsInfo = [];

/**
 * See #createStore for docs.
 *
 * This creates the store, adds it to the store info collection,
 * then recreates the combined AppState observable (optional)
 *
 * @param storeName
 * @param channel
 * @param Actions
 * @param Reducers
 * @param ActionFunctions
 * @param ActionObservables
 */
function registerStore(channel, _ref) {
  var Actions = _ref.Actions;
  var Reducers = _ref.Reducers;
  var ActionFunctions = _ref.ActionFunctions;
  var ActionObservables = _ref.ActionObservables;


  var store = (0, _createStore2.default)(channel, { Actions: Actions, Reducers: Reducers, ActionFunctions: ActionFunctions, ActionObservables: ActionObservables })(_AppDispatcher2.default);

  // add store to store info collection
  _storeInfo.push(store);

  // update app state observable with latest
  var storeObservables = _storeInfo.map(function (x) {
    return x.observable;
  });
  var appStateObservable = _kefir2.default.combine(storeObservables, function () {
    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
      observables[_key] = arguments[_key];
    }

    return observables.reduce(function (stores, store, i) {
      return Object.assign(stores, _defineProperty({}, '' + _storeInfo[i].name, store.state));
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

function registerSideEffects(channel, _ref2) {
  var SideEffects = _ref2.SideEffects;
  var SideEffectActionFunctions = _ref2.SideEffectActionFunctions;
  var SideEffectHandlers = _ref2.SideEffectHandlers;


  var sideEffectsFunction = (0, _createSideEffects2.default)(channel, { SideEffects: SideEffects, SideEffectActionFunctions: SideEffectActionFunctions, SideEffectHandlers: SideEffectHandlers });
  var sideEffects = sideEffectsFunction(_AppDispatcher2.default, AppState);

  // store side effects
  _sideEffectsInfo.push(sideEffects);

  // add side effect action functions to app state
  Object.assign(AppState, sideEffects.sideEffects);

  // setup one-way data flow
  sideEffects.observable.onValue(function () {
    return undefined;
  });
}

exports.default = AppState;
//# sourceMappingURL=AppState.js.map
