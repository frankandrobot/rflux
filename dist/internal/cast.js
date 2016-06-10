"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cast;
function cast(obj, Class) {

  return obj instanceof Class ? obj : new Class(obj);
}
//# sourceMappingURL=cast.js.map
