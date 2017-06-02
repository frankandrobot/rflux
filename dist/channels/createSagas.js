'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindSagaHandler = bindSagaHandler;
exports._createSagas = _createSagas;
exports.default = createSagas;

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _checkUnique = require('../internal/checkUnique');

var _checkUnique2 = _interopRequireDefault(_checkUnique);

var _createChannels = require('./createChannels');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

function _bindSagaHandlers(channel, ActionTypes, SagaHandlers) {

  return function (AppDispatcher) {
    return Object.keys(ActionTypes).reduce(function (observables, saga) {

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
 * Sagas are primarily used for handling ajax workflows.
 *
 * @param {Object} opts
 * @param {string} opts.channel - the name of the saga collection
 * @param {Map<string,*>} opts.ActionTypes - the names of the action types (aka side
 * effects) these sagas handle
 * @param {Map<ActionType,Function>} opts.SagaActionFunctions - (optional) map of action
 * functions indexed by ActionType. Like a channel's action functions, these functions
 * can be used to initiate a saga. Note that if you include one action function, then
 * every ActionType must have a corresponding action function.
 * @param {Function} opts.SagaHandlersFn - higher order function with signature
 * `({...sagaInterface})=>SagaHandlers` that accepts the `sagas` interface object and
 * returns the SagaHandlers. The SagaHandlers are a map of functions indexed by
 * ActionType i.e, Map<ActionType,Function>.
 * @return {Saga} higher order function that creates the saga.
 * @private
 */
function _createSagas(_ref) {
  var channel = _ref.channel,
      ActionTypes = _ref.ActionTypes,
      _ref$SagaActionFuncti = _ref.SagaActionFunctions,
      SagaActionFunctions = _ref$SagaActionFuncti === undefined ? {} : _ref$SagaActionFuncti,
      SagaHandlersFn = _ref.SagaHandlersFn;


  (0, _assert2.default)(typeof channel === 'string', 'Needs a channel and it needs to be a string');
  (0, _assert2.default)(ActionTypes, 'Need ActionTypes');
  (0, _assert2.default)(SagaHandlersFn, 'Need SagaHandlersFn');
  (0, _assert2.default)(typeof SagaHandlersFn === 'function', 'SagaHandlersFn should be a higher order function');

  return function (_ref2) {
    var AppDispatcher = _ref2.AppDispatcher,
        sagaInterface = _ref2.sagaInterface;


    /* eslint-disable new-cap */
    var SagaHandlers = SagaHandlersFn(_extends({}, sagaInterface));
    /* eslint-enable */

    //every side effect must map to an action function and handler
    Object.keys(ActionTypes).forEach(function (action) {
      if (SagaActionFunctions) {
        (0, _assert2.default)(SagaActionFunctions[action], 'Channel ' + channel + ' is missing side effect action function "' + action + '"');
      }
      (0, _assert2.default)(SagaHandlers[action], 'Channel ' + channel + ' is missing side effect handler "' + action + '"');
    });

    var observables = _bindSagaHandlers(channel, ActionTypes, SagaHandlers)(AppDispatcher);

    return {
      name: channel,
      observables: observables,
      actionFunctions: (0, _createChannels.bindActionFunctions)(ActionTypes, SagaActionFunctions)(AppDispatcher),
      resultObservables: _bindSagaResultObservables(observables)
    };
  };
}

function createSagas(_ref3) {
  var rawSagas = _ref3.rawSagas,
      args = _objectWithoutProperties(_ref3, ['rawSagas']);

  (0, _checkUnique2.default)(rawSagas, 'channel', 'Cannot have two sagas with the same name');
  return rawSagas.map(function (s) {
    return _createSagas(s)(_extends({}, args));
  });
}
//# sourceMappingURL=createSagas.js.map
