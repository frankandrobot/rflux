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
 * The differences between this class and RFluxContainer is:
 *
 * 1. You setup the observable via React props (not state)
 * 2. That means observers need to be recreated each time the Container's props change.
 *    (Hence, the "dangerously slow" name. Recreating observers on prop changes can be slow).
 * 3. You do NOT inherit from this class. Instead you can use it directly.
 *
 * ```javascript
 * render() {
 *   // "Child" has *values* from `observable` (not the stream itself) available as props.
 *   return <Container observable1={observable1}> <Child/> </Container>
 * }
 * ```
 */

var RFluxDangerouslySlowContainer = function (_React$Component) {
  _inherits(RFluxDangerouslySlowContainer, _React$Component);

  function RFluxDangerouslySlowContainer(props) {
    _classCallCheck(this, RFluxDangerouslySlowContainer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(RFluxDangerouslySlowContainer).call(this, props));
  }

  _createClass(RFluxDangerouslySlowContainer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {

      this.normalProps = (0, _ContainerHelpers.nonObservableState)(this.props);
      this.observables = (0, _ContainerHelpers.observableState)(this, this.props);
      this.callbacks = (0, _ContainerHelpers.setupObservableState)(this, this.observables, this.props.children.type.defaultProps);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {

      this.normalProps = (0, _ContainerHelpers.nonObservableState)(nextProps);

      //unsub previous
      (0, _ContainerHelpers.removeObservableState)(this.observables, this.callbacks);

      //subscribe new
      this.observables = (0, _ContainerHelpers.observableState)(nextProps);
      this.callbacks = (0, _ContainerHelpers.setupObservableState)(this, this.observables, this.props.children.type.defaultProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      (0, _ContainerHelpers.removeObservableState)(this.observables, this.callbacks);
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref;

      return _ref = {
        type: this.props.children.type
      }, _defineProperty(_ref, '$$typeof', Symbol.for('react.element')), _defineProperty(_ref, 'props', _extends({}, this.state, this.normalProps)), _ref;
    }
  }]);

  return RFluxDangerouslySlowContainer;
}(_react2.default.Component);

exports.default = RFluxDangerouslySlowContainer;
//# sourceMappingURL=RFluxDangerouslySlowContainer.js.map
