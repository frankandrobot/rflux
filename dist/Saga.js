'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sideEffects = undefined;
exports.put = put;
exports.call = call;
exports.result = result;
exports.listen = listen;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _kefirEmitter = require('./support/kefirEmitter');

var _kefirEmitter2 = _interopRequireDefault(_kefirEmitter);

var _kefirUtils = require('./support/kefirUtils');

var _AppDispatcher = require('./AppDispatcher');

var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);

var _Constants = require('./Constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var sideEffects = exports.sideEffects = (0, _kefirEmitter2.default)();

var callObservable = sideEffects.filter(function (action) {
  return action.action === 'CALL';
}).map(function (action) {
  return action.payload;
}).flatMap(function (action) {

  var uuid = action.uuid;
  var result = action.fn.apply(action, _toConsumableArray(action.args));
  var resultObservable = (0, _kefirUtils.isObservable)(result) ? result : _kefir2.default.constant(result);

  return resultObservable.map(function (rslt) {
    return { uuid: uuid, rslt: rslt };
  });
}).onValue(function () {
  return undefined;
});

function put(action) {

  setTimeout(function () {
    return _AppDispatcher2.default.emit(action);
  }, 0);
}

function call(fn) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var id = _uuid2.default.v4();

  setTimeout(function () {
    return sideEffects.emit({ action: 'CALL', payload: { fn: fn, args: args, uuid: id } });
  }, 0);

  return callObservable.filter(function (fn) {
    return fn.uuid === id;
  }).map(function (fn) {
    return fn.rslt;
  }).take(1);
}

function result(__sideEffectCallId) {

  return function (rslt) {

    var action = {
      channel: _Constants.Channels.system,
      actionType: _Constants.ActionTypes.sideEffectResult,
      __sideEffectCallId: __sideEffectCallId,
      payload: rslt
    };

    setTimeout(function () {
      return sideEffects.emit({ action: 'PUT', payload: action });
    }, 0);

    return rslt;
  };
}

function listen(channel, actionType) {

  return _AppDispatcher2.default.filter(function (action) {
    return action.channel === channel && action.actionType === actionType;
  }).map(function (action) {
    return action.payload;
  });
}
//# sourceMappingURL=Saga.js.map
