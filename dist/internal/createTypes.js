"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTypes;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * All this does is save typing when creating actionTypes.
 * If I'm not mistaken keymirror does the same thing
 *
 * @deprecated use keymirror package
 * @param actions
 * @returns {*}
 */
function createTypes(actions) {

  actions = actions || [];
  actions = Array.isArray(actions) ? actions : [actions];

  return actions.reduce(function (total, arg) {
    return Object.assign(total, _defineProperty({}, arg, arg));
  }, {});
}
//# sourceMappingURL=createTypes.js.map
