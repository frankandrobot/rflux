'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReduxSaga = exports.sagaMessageBus = exports.fakeAppDispatcher = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.reduxSagaMiddleware = reduxSagaMiddleware;

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _kefirEmitter = require('../utils/kefirEmitter');

var _kefirEmitter2 = _interopRequireDefault(_kefirEmitter);

var _isObservable = require('../internal/isObservable');

var _isObservable2 = _interopRequireDefault(_isObservable);

var _uuid = require('../internal/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fakeAppDispatcher = exports.fakeAppDispatcher = (0, _kefirEmitter2.default)();
var sagaMessageBus = exports.sagaMessageBus = (0, _kefirEmitter2.default)();

/**
 * Call the action and return the result (as an observable)
 */
var callObservable = sagaMessageBus.filter(function (action) {
  return action.action === 'CALL';
}).map(function (action) {
  return action.payload;
}).flatMap(function (action) {

  var callId = action.callId;
  var result = action.fn.apply(action, _toConsumableArray(action.args));
  var resultObservable = (0, _isObservable2.default)(result) ? result : _kefir2.default.constant(result);

  return resultObservable.map(function (rslt) {
    return { callId: callId, rslt: rslt };
  });
}).onValue(function () {
  return undefined;
});

/**
 * @param {String} channel
 * @param {Map} ActionTypes - map whose keys are the names of the side effects
 * @param {Map} SagaActionFunctions - (optional) map of action functions
 * @param {Map} SagaHandlers - map of handler functions
 * @returns {Object} redux middleware
 */
function reduxSagaMiddleware(channel, _ref) {
  var ActionTypes = _ref.ActionTypes,
      SagaActionFunctions = _ref.SagaActionFunctions,
      SagaHandlers = _ref.SagaHandlers;


  (0, _assert2.default)(typeof channel === 'string', 'Needs a channel and it needs to be a string');
  (0, _assert2.default)(ActionTypes, 'Need ActionTypes');
  (0, _assert2.default)(SagaHandlers, 'Need SagaHandlers');

  //every side effect must map to an action function and handler
  Object.keys(ActionTypes).forEach(function (action) {
    if (SagaActionFunctions) {
      (0, _assert2.default)(SagaActionFunctions[action], 'Channel ' + channel + ' is missing side effect action function "' + action + '"');
    }
    (0, _assert2.default)(SagaHandlers[action], 'Channel ' + channel + ' is missing side effect handler "' + action + '"');
  });

  SagaActionFunctions = SagaActionFunctions || {};

  return function () {
    return function (next) {
      return function (action) {

        setTimeout(function () {
          return SagaHandlers[action.type](action);
        }, 0);
        setTimeout(function () {
          return fakeAppDispatcher.emit(action);
        }, 0);

        return next(action);
      };
    };
  };
}

var ReduxSaga = exports.ReduxSaga = function () {
  function ReduxSaga(store) {
    _classCallCheck(this, ReduxSaga);

    this.store = store;
  }

  _createClass(ReduxSaga, [{
    key: 'put',
    value: function put(action) {
      var _this = this;

      setTimeout(function () {
        return _this.store.dispatch(action);
      }, 0);

      return _kefir2.default.constant(action); // streamified so we can chain together
    }
  }, {
    key: 'call',
    value: function call(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var callId = (0, _uuid2.default)();

      setTimeout(function () {
        return sagaMessageBus.emit({ action: 'CALL', payload: { fn: fn, args: args, callId: callId } });
      }, 0);

      return callObservable.filter(function (fn) {
        return fn.callId === callId;
      }).map(function (fn) {
        return fn.rslt;
      }).take(1);
    }
  }, {
    key: 'listen',
    value: function listen(channel, actionType) {

      return fakeAppDispatcher.filter(function (action) {
        return action.channel === channel && action.actionType === actionType;
      }).map(function (action) {
        return action.payload;
      });
    }
  }]);

  return ReduxSaga;
}();
//# sourceMappingURL=ReduxSaga.js.map
