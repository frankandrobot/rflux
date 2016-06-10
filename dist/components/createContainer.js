'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isObservable = require('../internal/isObservable');

var _isObservable2 = _interopRequireDefault(_isObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * If a prop is an observable, create a listener and pass the observed values as props.
 * Otherwise, pass the prop into the child component, which must be a stateless functional component.
 *
 * containerProps are props to pass to the container
 *
 * Note: container defaultProps get passed to child
 *
 * @param childProps to pass to child container
 * @param parentDefaultProps - default props and propTypes of parent container
 * @returns {Function}
 */
function createContainer() {
  var childProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var parentDefaultProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


  var observables = Object.keys(childProps).filter(function (prop) {
    return (0, _isObservable2.default)(childProps[prop]);
  }).map(function (prop) {
    return { property: prop, observable: childProps[prop] };
  });

  var nonObservableProps = Object.keys(childProps).filter(function (prop) {
    return !(0, _isObservable2.default)(childProps[prop]);
  }).reduce(function (total, prop) {
    return Object.assign(total, _defineProperty({}, prop, childProps[prop]));
  }, {});

  var _parentDefaultProps$p = parentDefaultProps.propTypes;
  var propTypes = _parentDefaultProps$p === undefined ? {} : _parentDefaultProps$p;
  var _parentDefaultProps$g = parentDefaultProps.getDefaultProps;

  var _getDefaultProps = _parentDefaultProps$g === undefined ? function () {
    return undefined;
  } : _parentDefaultProps$g;

  return function (StatelessFunctionalComponent) {
    return _react2.default.createClass({

      propTypes: propTypes,

      getDefaultProps: function getDefaultProps() {
        return _getDefaultProps();
      },
      componentWillMount: function componentWillMount() {

        var that = this;

        that.unsub = observables.map(function (obj) {
          return obj.observable._onValue(function (val) {
            return that.setState(_defineProperty({}, obj.property, val));
          });
        }) || [];
      },
      componentWillUnmount: function componentWillUnmount() {

        this.unsub.forEach(function (unsub) {
          return unsub();
        });
      },
      render: function render() {
        return _react2.default.createElement(StatelessFunctionalComponent, _extends({}, this.state, nonObservableProps, this.props));
      }
    });
  };
}
exports.default = createContainer;
//# sourceMappingURL=createContainer.js.map
