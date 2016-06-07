'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = kefirEmitter;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function kefirEmitter() {

  var emitter = _kefir2.default.pool();

  return Object.assign(emitter, { emit: function emit(message) {
      return emitter.plug(_kefir2.default.constant(message));
    } });
}
//# sourceMappingURL=kefirEmitter.js.map
