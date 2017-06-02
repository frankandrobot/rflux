"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = assert;
/**
 * @param {expresson} condition boolean expression
 * @param {string} message
 * @returns {void}
 * @private
 */
function assert(condition, message) {

  if (!condition) {
    throw new Error(message);
  }
}
//# sourceMappingURL=assert.js.map
