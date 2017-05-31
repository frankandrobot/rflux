'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ContainerHelpers = require('../internal/ContainerHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-use-before-define:0 */


/**
 * Natural interface---just wrap a child view in this container class and pass values via props.
 * No complex state functions.
 * Because it supports parent React props, it can be inefficient for arbitrary prop changes.
 */
var DangerouslySlowContainer = function (_React$Component) {
  _inherits(DangerouslySlowContainer, _React$Component);

  function DangerouslySlowContainer(props, __dangerouslyEnableSlowness) {
    _classCallCheck(this, DangerouslySlowContainer);

    var _this = _possibleConstructorReturn(this, (DangerouslySlowContainer.__proto__ || Object.getPrototypeOf(DangerouslySlowContainer)).call(this, props));

    _this.__dangerouslyEnableSlowness = __dangerouslyEnableSlowness || true;
    return _this;
  }

  _createClass(DangerouslySlowContainer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {

      (0, _ContainerHelpers.setupNonObservables)(this, this.props, false);
      (0, _ContainerHelpers.setupObservables)(this, this.props, this.props.children.type.defaultProps);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {

      if (this.__dangerouslyEnableSlowness) {

        (0, _ContainerHelpers.removeObservables)(this);
        (0, _ContainerHelpers.setupNonObservables)(this, nextProps, false);
        (0, _ContainerHelpers.setupObservables)(this, nextProps, this.props.children.type.defaultProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      (0, _ContainerHelpers.removeObservables)(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref;

      return _ref = {
        type: this.props.children.type
      }, _defineProperty(_ref, '$$typeof', Symbol.for('react.element')), _defineProperty(_ref, 'props', _extends({}, this._nonObservables, this.state)), _ref;
    }
  }]);

  return DangerouslySlowContainer;
}(_react2.default.Component);

exports.default = DangerouslySlowContainer;
//# sourceMappingURL=Container.js.map
