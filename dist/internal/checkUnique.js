"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkUnique;
/**
 * Checks that the given prop occurs only once in the array of objects
 * @param {[]} arrayOfObjs
 * @param {string} prop
 * @param {string} msg
 * @private
 */
function checkUnique() {
  var arrayOfObjs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var prop = arguments[1];
  var msg = arguments[2];

  var hist = {};

  for (var i in arrayOfObjs) {
    var item = arrayOfObjs[i];

    hist[item[prop]] = (hist[item[prop]] || 0) + 1;
    if (hist[item[prop]] >= 2) {
      throw new Error(msg + ": " + item[prop]);
    }
  }
}
//# sourceMappingURL=checkUnique.js.map
