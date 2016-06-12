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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The difference between this class RFluxDangerouslySlowContainer is:
 *
 * 1. You set observables via React state (not props).
 *    This means that you set observables exactly once for the life of the component.
 *    See below for a workaround.
 * 2. You need to inherit this class in order to use it.
 * 3. The use case is when you need access to parts of the state (most cases).
 *
 * ```javascript
 * class Container extends RFluxContainer {
 *   constructor(props) {
 *     super(props);
 *     this.state = { foo: 'initial value' }
 *   }
 *
 *   getInitialObservableState() {
 *      return {
 *         foo: observable1,
 *         randomfoo: () => this.setState({foo: Math.random()})
 *      }
 *   }
 * }
 *
 * export default () => <Container> <Child/> </Container>
 * ```
 *
 * # What if observables are functions of React properties?
 *
 * Actually this probably isn't an issue anymore.
 * If so then RFFluxDangerouslySlowContainer can be safely deprecated.
 */

var RFluxContainer = function (_React$Component) {
  _inherits(RFluxContainer, _React$Component);

  function RFluxContainer(props) {
    _classCallCheck(this, RFluxContainer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RFluxContainer).call(this, props));

    var noop = function noop() {
      return {};
    };
    var initialState = (_this.getInitialObservableState || noop)();

    _this._observableState = (0, _ContainerHelpers.observableState)(initialState);
    _this._nonObservableState = (0, _ContainerHelpers.nonObservableState)(initialState);
    return _this;
  }

  _createClass(RFluxContainer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {

      this._callbacks = (0, _ContainerHelpers.setupObservableState)(this, this._observableState, this.props.children.type.defaultProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      (0, _ContainerHelpers.removeObservableState)(this._observableState, this._callbacks);
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref;

      return _ref = {
        type: this.reprops.children.type
      }, _defineProperty(_ref, '$$typeof', Symbol.for('react.element')), _defineProperty(_ref, 'props', _extends({}, this.state, this._nonObservableState)), _ref;
    }
  }]);

  return RFluxContainer;
}(_react2.default.Component);

exports.default = RFluxContainer;
//# sourceMappingURL=RFluxContainer.js.map
