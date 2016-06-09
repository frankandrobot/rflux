'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindSagaHandler = bindSagaHandler;
exports.default = createSagas;

var _assert = require('./support/assert');

var _assert2 = _interopRequireDefault(_assert);

var _Saga = require('./Saga');

var _createStore = require('./createStore');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function bindSagaHandler(channel, sagaName, sagaHandler) {

  return function (AppDispatcher) {
    return AppDispatcher.filter(function (x) {
      return x.channel === channel && x.actionType === sagaName;
    }).flatMap(function (x) {
      return sagaHandler(x.payload);
    });
  };
}

function _bindSagaHandlers(channel, Sagas, SagaHandlers) {

  return function (AppDispatcher) {
    return Object.keys(Sagas).reduce(function (observables, handlerName) {
      var handler = SagaHandlers[handlerName];
      var observable = bindSagaHandler(channel, handlerName, handler)(AppDispatcher);

      return Object.assign(observables, _defineProperty({}, handlerName, observable));
    }, {});
  };
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
    return {
      name: channel,
      observables: _bindSagaHandlers(channel, Sagas, SagaHandlers)(AppDispatcher),
      actionFunctions: (0, _createStore.bindActionFunctions)(Sagas, SagaActionFunctions)(AppDispatcher)
    };
  };
}
//# sourceMappingURL=createSagas.js.map
