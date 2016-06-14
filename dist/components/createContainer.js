'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createContainer;

var _createDangeourslySlowContainer = require('./createDangeourslySlowContainer');

var _createDangeourslySlowContainer2 = _interopRequireDefault(_createDangeourslySlowContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Doesn't support parent React props.
 * However, you can define complex state functions.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Function} getDefaultProps - container default props. Passed to child as props.
 * @param {Function} getInitialState - container initial state. Passed to child as props.
 * @param {Function} getObservableState - pass observables here. Observable *values* passed to child as props
 * @param {*} propTypes - container propTypes.
 * @returns {Function} that receives the child view
 */
function createContainer(_ref) {
  var _ref$getDefaultProps = _ref.getDefaultProps;
  var getDefaultProps = _ref$getDefaultProps === undefined ? function () {
    return {};
  } : _ref$getDefaultProps;
  var _ref$getInitialState = _ref.getInitialState;
  var getInitialState = _ref$getInitialState === undefined ? function () {
    return {};
  } : _ref$getInitialState;
  var _ref$getObservableSta = _ref.getObservableState;
  var getObservableState = _ref$getObservableSta === undefined ? function () {
    return {};
  } : _ref$getObservableSta;
  var _ref$propTypes = _ref.propTypes;
  var propTypes = _ref$propTypes === undefined ? {} : _ref$propTypes;


  return (0, _createDangeourslySlowContainer2.default)({
    getDefaultProps: getDefaultProps,
    getInitialState: getInitialState,
    getObservableState: getObservableState,
    propTypes: propTypes,
    __dangerouslyEnableSlowness: false
  });
}
//# sourceMappingURL=createContainer.js.map
