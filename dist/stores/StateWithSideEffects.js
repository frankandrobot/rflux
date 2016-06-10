"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.combineSideEffects = combineSideEffects;
exports.addSideEffects = addSideEffects;
exports.sideEffects = sideEffects;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Hey, look! Something like a monad
 */

var StateWithSideEffects = exports.StateWithSideEffects = function () {
  function StateWithSideEffects(state, sideEffects) {
    _classCallCheck(this, StateWithSideEffects);

    this.state = state || {};
    this.sideEffects = sideEffects || [];
  }

  _createClass(StateWithSideEffects, [{
    key: "combine",
    value: function combine(stateOrStateWithSideEffects) {

      return new StateWithSideEffects(_extends({}, this.state, stateOrStateWithSideEffects.state), this.sideEffects.concat(stateOrStateWithSideEffects.sideEffects));
    }
  }]);

  return StateWithSideEffects;
}();

/**
 * In a typed language this method wouldn't exist,
 * but since it's so easy to forget to return the proper class,
 * we add this to help prevent errors.
 *
 * @param a
 * @param b
 * @returns {*}
 */


function combineSideEffects(a, b) {

  var aIsStateWithSideEffects = a instanceof StateWithSideEffects;
  var bIsStateWithSideEffects = b instanceof StateWithSideEffects;

  if (aIsStateWithSideEffects && bIsStateWithSideEffects) {

    return a.combine(b);
  } else if (!aIsStateWithSideEffects && !bIsStateWithSideEffects) {

    return new StateWithSideEffects(_extends({}, a, b));
  } else if (aIsStateWithSideEffects && !bIsStateWithSideEffects) {

    return new StateWithSideEffects((_extends({}, a.state, b), a.sideEffects));
  } else if (!aIsStateWithSideEffects && bIsStateWithSideEffects) {

    return new StateWithSideEffects(_extends({}, a, b.state), b.sideEffects);
  }
}

function addSideEffects(state) {
  for (var _len = arguments.length, sideEffects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sideEffects[_key - 1] = arguments[_key];
  }

  return new StateWithSideEffects(state, sideEffects);
}

function sideEffects() {
  for (var _len2 = arguments.length, sideEffects = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    sideEffects[_key2] = arguments[_key2];
  }

  return new StateWithSideEffects({}, sideEffects);
}
//# sourceMappingURL=StateWithSideEffects.js.map
