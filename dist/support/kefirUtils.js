'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObservable = isObservable;

var _kefir = require('kefir');

function isObservable(obj) {

  return obj && obj instanceof _kefir.Observable;
}
//# sourceMappingURL=kefirUtils.js.map
