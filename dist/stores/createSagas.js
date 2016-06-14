'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindSagaHandler = bindSagaHandler;
exports.default = createSagas;

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _createStore = require('./createStore');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function bindSagaHandler(channel, sagaName, sagaHandler) {

  return function (AppDispatcher) {
    return AppDispatcher.filter(function (x) {
      return x.channel === channel && x.actionType === sagaName;
    }).flatMap(function (x) {
      return sagaHandler(x.payload);
    }).map(function (result) {
      // emit the result back to the app dispatcher for time travel.
      setTimeout(function () {
        return AppDispatcher.emit({ channel: channel, actionType: sagaName + 'Result', payload: result });
      }, 0);
      return result;
    });
  };
}

function _bindSagaHandlers(channel, Sagas, SagaHandlers) {

  return function (AppDispatcher) {
    return Object.keys(Sagas).reduce(function (observables, saga) {

      var handler = SagaHandlers[saga];
      var observable = bindSagaHandler(channel, saga, handler)(AppDispatcher);

      return Object.assign(observables, _defineProperty({}, saga, observable));
    }, {});
  };
}

function _bindSagaResultObservables(sagas) {

  return Object.keys(sagas).reduce(function (observables, saga) {
    return Object.assign(observables, _defineProperty({}, saga + 'ResultObservable', sagas[saga]));
  }, {});
}

/**
  * SideEffectActionFunctions are optional but if you pass these,
  * then every SideEffect must have a corresponding action function.
  *
  * @param channel
  * @param Sagas - map whose keys are the names of the side effects
  * @param SagaActionFunctions - (optional) map of action functions
  * @param SagaHandlers - map of handler functions
  */
function createSagas(channel, _ref) {
  var Sagas = _ref.Sagas;
  var SagaActionFunctions = _ref.SagaActionFunctions;
  var SagaHandlers = _ref.SagaHandlers;


  (0, _assert2.default)(typeof channel === 'string', 'Needs a channel and it needs to be a string');
  (0, _assert2.default)(Sagas, 'Need Sagas');
  (0, _assert2.default)(SagaHandlers, 'Need SagaHandlers');

  //every side effect must map to an action function and handler
  Object.keys(Sagas).forEach(function (action) {
    if (SagaActionFunctions) {
      (0, _assert2.default)(SagaActionFunctions[action], 'Channel ' + channel + ' is missing side effect action function "' + action + '"');
    }
    (0, _assert2.default)(SagaHandlers[action], 'Channel ' + channel + ' is missing side effect handler "' + action + '"');
  });

  SagaActionFunctions = SagaActionFunctions || {};

  return function (AppDispatcher) {

    var observables = _bindSagaHandlers(channel, Sagas, SagaHandlers)(AppDispatcher);

    return {
      name: channel,
      observables: observables,
      actionFunctions: (0, _createStore.bindActionFunctions)(Sagas, SagaActionFunctions)(AppDispatcher),
      resultObservables: _bindSagaResultObservables(observables)
    };
  };
}
//# sourceMappingURL=createSagas.js.map
