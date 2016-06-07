'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = kefirEmitter;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * A pool makes an amazing bus. It has one flat (bug),
  * it's first event is undefined.
  */
function kefirEmitter() {

  var emitter = _kefir2.default.pool();
  var skipFirst = emitter.skip(1);

  skipFirst.emit = function (message) {
    return emitter.plug(_kefir2.default.constant(message));
  };

  return skipFirst;
}
//# sourceMappingURL=kefirEmitter.js.map
