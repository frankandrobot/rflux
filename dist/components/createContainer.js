'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createContainer;

var _createDangerouslySlowContainer = require('./createDangerouslySlowContainer');

var _createDangerouslySlowContainer2 = _interopRequireDefault(_createDangerouslySlowContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Doesn't support parent React props.
 * However, you can define complex state functions.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Object} opts
 * @param {Function} opts.getDefaultProps - container default props. Passed to child as
 * props.
 * @param {Function} opts.getInitialState - container initial state. Passed to child as
 * props.
 * @param {Function} opts.getObservableState - pass observables here. Observable *values*
 * passed to child as props
 * @param {*} opts.propTypes - container propTypes.
 * @returns {Function} that receives the child view
 */
function createContainer(_ref) {
  var _ref$getDefaultProps = _ref.getDefaultProps,
      getDefaultProps = _ref$getDefaultProps === undefined ? function () {
    return {};
  } : _ref$getDefaultProps,
      _ref$getInitialState = _ref.getInitialState,
      getInitialState = _ref$getInitialState === undefined ? function () {
    return {};
  } : _ref$getInitialState,
      _ref$getObservableSta = _ref.getObservableState,
      getObservableState = _ref$getObservableSta === undefined ? function () {
    return {};
  } : _ref$getObservableSta,
      _ref$propTypes = _ref.propTypes,
      propTypes = _ref$propTypes === undefined ? {} : _ref$propTypes;


  return (0, _createDangerouslySlowContainer2.default)({
    getDefaultProps: getDefaultProps,
    getInitialState: getInitialState,
    getObservableState: getObservableState,
    propTypes: propTypes,
    __dangerouslyEnableSlowness: false
  });
}
//# sourceMappingURL=createContainer.js.map
