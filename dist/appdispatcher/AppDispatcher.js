'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kefirEmitter = require('../utils/kefirEmitter');

var _kefirEmitter2 = _interopRequireDefault(_kefirEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is the global AppDispatcher.
 * Every action must go through the AppDispatcher.
 *
 * Returns a Kefir.pool() that we use a bus.
 *
 **/
exports.default = (0, _kefirEmitter2.default)();
//# sourceMappingURL=AppDispatcher.js.map
