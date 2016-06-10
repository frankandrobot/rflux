'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isObservable;

var _kefir = require('kefir');

function isObservable(obj) {

  return obj && obj instanceof _kefir.Observable;
}
//# sourceMappingURL=isObservable.js.map
