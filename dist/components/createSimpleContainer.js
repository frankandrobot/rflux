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
 * The container passes React props and state to its child as props.
 * The main feature is that it converts observables into *values*...
 * while automagically managing the observer lifecycle.
 *
 * Since container props and state both get mapped as child props,
 * please be aware that state overriddes props with the same name.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * ```javascript
 * createContainer({
 *   getObservableState() {
 *     return {
 *       value: observable.map(x => x.foo)
 *     }
 *   }
 * })(Child)
 *
 * const Child = value => <div>{value}</div> //gets the value of the observable as a prop!
 * ```
 *
 * @param getInitialState - container initial state. Passed to child as props.
 * @param getObservableState - pass observables here. Observable *values* passed to child as props
 * @param getDefaultProps - container default props. Passed to child as props.
 * @param propTypes - container propTypes.
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
  var _ref$getDefaultProps = _ref.getDefaultProps;

  var _getDefaultProps = _ref$getDefaultProps === undefined ? function () {
    return {};
  } : _ref$getDefaultProps;

  var _ref$propTypes = _ref.propTypes;
  var propTypes = _ref$propTypes === undefined ? {} : _ref$propTypes;


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

        this.setState(_nonObservableState);

        this._observableState = (0, _ContainerHelpers.observableState)(_observableState);
        this._callbacks = (0, _ContainerHelpers.setupObservableState)(this, this._observableState);
      },
      componentWillUnmount: function componentWillUnmount() {

        (0, _ContainerHelpers.removeObservableState)(this._observableState, this._callbacks);
      },
      render: function render() {
        return _react2.default.createElement(StatelessFunctionalComponent, _extends({}, this.props, this.state));
      }
    });
  };
}
exports.default = createContainer;
//# sourceMappingURL=createSimpleContainer.js.map
