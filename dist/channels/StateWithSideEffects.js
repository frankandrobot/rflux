"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.state = state;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Hey, look! Something like a monad (dang, forget I said the "m" word.)
 *
 * `StateWithSideEffects` is basically state plus an array of messages (the side
 * effects to be executed).
 *
 * You can combine it with State or with another StateWithSideEffects, or add side
 * effects to an existing StateWithSideEffects.
 */
var StateWithSideEffects = function () {

  /**
   * @param {State} state
   * @param {Message[]} sideEffects
   */
  function StateWithSideEffects(state, sideEffects) {
    _classCallCheck(this, StateWithSideEffects);

    this.state = state || {};
    this.sideEffects = sideEffects || [];
  }

  /**
   * Can combine `StateWithSideEffects` with another `StateWithSideEffects` or with state.
   * @param {StateWithSideEffects|State} b
   * @returns {StateWithSideEffects} the result
   */


  _createClass(StateWithSideEffects, [{
    key: "combine",
    value: function combine(b) {

      return b instanceof StateWithSideEffects ? new StateWithSideEffects(_extends({}, this.state, b.state), this.sideEffects.concat(b.sideEffects)) : new StateWithSideEffects((_extends({}, this.state, b), this.sideEffects));
    }
  }, {
    key: "addSideEffects",
    value: function addSideEffects() {
      for (var _len = arguments.length, sideEffects = Array(_len), _key = 0; _key < _len; _key++) {
        sideEffects[_key] = arguments[_key];
      }

      return new StateWithSideEffects(_extends({}, this.state), this.sideEffects.concat(sideEffects));
    }
  }]);

  return StateWithSideEffects;
}();

/**
 * Constructor helper
 *
 * @param {*} state
 * @param {Message[]} sideEffects - array of side effects
 * @returns {StateWithSideEffects} instance
 */


exports.default = StateWithSideEffects;
function state() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  return new StateWithSideEffects(state);
}
//# sourceMappingURL=StateWithSideEffects.js.map
