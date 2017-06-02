"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * instead of taking a dep on uuid, create a practically infinite sequence of ids.
 * Date.now() tweaked with a random number because it can actually return the same
 * values twice.
 * @returns {string} uuid
 * @private
 */
exports.default = function () {
  return Date.now() + "." + Math.random();
};
//# sourceMappingURL=uuid.js.map
