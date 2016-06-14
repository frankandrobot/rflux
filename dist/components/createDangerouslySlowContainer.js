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

/**
 * Supports parent React props at the expense of potentially being inefficient:
 *
 * > Every #componentWillReceiveProps forces observer re-initialization.
 * > Therefore it is your responsibility to ensure that it doesn't get called too often.
 *
 * Since container props and state both get mapped as child props,
 * state overriddes props with the same name.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Function} getDefaultProps - container default props. Passed to child as props.
 * @param {Function} getInitialState - container initial state. Passed to child as props.
 * @param {Function} getObservableState - pass observables here. Observable *values* passed to child as props
 * @param {*} propTypes - container propTypes.
 * @returns {Function} that returns the container
 */
function createDangerouslySlowContainer(_ref) {
  var _ref$getDefaultProps = _ref.getDefaultProps;

  var _getDefaultProps = _ref$getDefaultProps === undefined ? function () {
    return {};
  } : _ref$getDefaultProps;

  var _ref$getInitialState = _ref.getInitialState;

  var _getInitialState = _ref$getInitialState === undefined ? function () {
    return {};
  } : _ref$getInitialState;

  var _ref$getObservableSta = _ref.getObservableState;
  var getObservableState = _ref$getObservableSta === undefined ? function () {
    return {};
  } : _ref$getObservableSta;
  var _ref$propTypes = _ref.propTypes;
  var propTypes = _ref$propTypes === undefined ? {} : _ref$propTypes;
  var _ref$__dangerouslyEna = _ref.__dangerouslyEnableSlowness;

  var __dangerouslyEnableSlowness = _ref$__dangerouslyEna === undefined ? true : _ref$__dangerouslyEna;

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

        var observableState = getObservableState.call(this);

        (0, _ContainerHelpers.setupNonObservables)(this, observableState);
        (0, _ContainerHelpers.setupObservables)(this, observableState);
      },
      componentWillReceiveProps: function componentWillReceiveProps() {

        if (__dangerouslyEnableSlowness) {

          var observableState = getObservableState.call(this);

          (0, _ContainerHelpers.removeObservables)(this);
          (0, _ContainerHelpers.setupObservables)(this, observableState);
        }
      },
      componentWillUnmount: function componentWillUnmount() {

        (0, _ContainerHelpers.removeObservables)(this);
      },
      render: function render() {
        return _react2.default.createElement(StatelessFunctionalComponent, _extends({}, this.props, this.state));
      }
    });
  };
}
exports.default = createDangerouslySlowContainer;
//# sourceMappingURL=createDangerouslySlowContainer.js.map
