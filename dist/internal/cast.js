"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cast;
/**
 * @param {Object} obj
 * @param {Class} Class
 * @returns {Class} instance of class
 * @private
 */
function cast(obj, Class) {

  return obj instanceof Class ? obj : new Class(obj);
}
//# sourceMappingURL=cast.js.map
