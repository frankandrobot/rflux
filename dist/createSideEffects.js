'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createSideEffects;

var _assert = require('./support/assert');

var _assert2 = _interopRequireDefault(_assert);

var _Saga = require('./Saga');

var _createStore = require('./createStore');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _bindSideEffectsObservable(channel, SideEffectHandlers) {

  return function (AppDispatcher, AppState) {
    return AppDispatcher.filter(function (x) {
      return x.channel === channel;
    }).flatMap(function (action) {

      var handler = SideEffectHandlers[action.actionType];

      if (!handler) {
        throw new Error('Channel ' + channel + ' does not support side effect "' + action.actionType + '"');
      }

      return handler(action.payload, AppState, (0, _Saga.result)(action.__sideEffectCallId));
    });
  };
}

/**
  * SideEffectActionFunctions are optional but if you pass these,
  * then every SideEffect must have a corresponding action function.
  *
  * @param channel
  * @param SideEffects - map whose keys are the names of the side effects
  * @param SideEffectActionFunctions - (optional) map of action functions
  * @param SideEffectHandlers - map of handler functions
  */
function createSideEffects(channel, _ref) {
  var SideEffects = _ref.SideEffects;
  var SideEffectActionFunctions = _ref.SideEffectActionFunctions;
  var SideEffectHandlers = _ref.SideEffectHandlers;


  (0, _assert2.default)(typeof channel === 'string', 'Needs a channel and it needs to be a string');
  (0, _assert2.default)(SideEffects, 'Need SideEffects');
  (0, _assert2.default)(SideEffectHandlers, 'Need SideEffectHandlers');

  //every side effect must map to an action function and handler
  Object.keys(SideEffects).forEach(function (action) {
    if (SideEffectActionFunctions) {
      (0, _assert2.default)(SideEffectActionFunctions[action], 'Channel ' + channel + ' is missing side effect action function "' + action + '"');
    }
    (0, _assert2.default)(SideEffectHandlers[action], 'Channel ' + channel + ' is missing side effect handler "' + action + '"');
  });

  SideEffectActionFunctions = SideEffectActionFunctions || {};

  return function (AppDispatcher, AppState) {
    return {
      name: channel,
      observable: _bindSideEffectsObservable(channel, SideEffectHandlers)(AppDispatcher, AppState),
      sideEffects: (0, _createStore.bindActionFunctions)(SideEffectActionFunctions)(AppDispatcher)
    };
  };
}
//# sourceMappingURL=createSideEffects.js.map
