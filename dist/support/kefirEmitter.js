'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = kefirEmitter;

var _kefirjs = require('kefirjs');

var _kefirjs2 = _interopRequireDefault(_kefirjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function kefirEmitter() {

  var emitter = _kefirjs2.default.pool();

  emitter.emit = function (message) {
    return emitter.plug(_kefirjs2.default.constant(message));
  };

  return emitter;
}
//# sourceMappingURL=kefirEmitter.js.map
