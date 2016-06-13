'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ContainerHelpers = require('../internal/ContainerHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * If a prop is an observable, create a listener and pass the observed values as props.
 * Otherwise, pass the prop into the child component, which must be a stateless functional component.
 *
 * The use case is when you don't need access to other parts of the state.
 *
 * @param getInitialState - the default container state
 * @param getObservableState - passed to child container as props
 * @param containerDefaults - default props and propTypes of parent container
 * @returns {Function}
 */
function createContainer(_ref) {
  var _ref$getInitialState = _ref.getInitialState;

  var _getInitialState = _ref$getInitialState === undefined ? function () {
    return {};
  } : _ref$getInitialState;

  var _ref$getObservableSta = _ref.getObservableState;
  var getObservableState = _ref$getObservableSta === undefined ? function () {
    return {};
  } : _ref$getObservableSta;
  var _ref$containerDefault = _ref.containerDefaults;
  var containerDefaults = _ref$containerDefault === undefined ? {} : _ref$containerDefault;
  var _containerDefaults$pr = containerDefaults.propTypes;
  var propTypes = _containerDefaults$pr === undefined ? {} : _containerDefaults$pr;
  var _containerDefaults$ge = containerDefaults.getDefaultProps;

  var _getDefaultProps = _containerDefaults$ge === undefined ? function () {
    return undefined;
  } : _containerDefaults$ge;

  return function (StatelessFunctionalComponent) {
    return _react2.default.createClass({

      propTypes: propTypes,

      getInitialState: function getInitialState() {
        return _getInitialState.call(this);
      },
      getDefaultProps: function getDefaultProps() {
        return _getDefaultProps();
      },
      componentWillMount: function componentWillMount() {

        var _observableState = getObservableState.call(this);
        var _nonObservableState = (0, _ContainerHelpers.nonObservableState)(_observableState);

        this.setState.apply(this, _toConsumableArray(_nonObservableState));

        this._observableState = _observableState(_observableState);
        this._callbacks = (0, _ContainerHelpers.setupObservableState)(this, this._observableState);
      },
      componentWillUnmount: function componentWillUnmount() {

        (0, _ContainerHelpers.removeObservableState)(this._observableState, this._callbacks);
      },
      render: function render() {
        return _react2.default.createElement(StatelessFunctionalComponent, _extends({}, this.state, this.props));
      }
    });
  };
}
exports.default = createContainer;
//# sourceMappingURL=createSimpleContainer.js.map
