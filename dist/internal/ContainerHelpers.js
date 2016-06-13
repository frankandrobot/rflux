'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupObservableState = setupObservableState;
exports.removeObservableState = removeObservableState;
exports.observableState = observableState;
exports.nonObservableState = nonObservableState;

var _isObservable = require('../internal/isObservable');

var _isObservable2 = _interopRequireDefault(_isObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param component
 * @param prop
 * @private
 */
function _callback(component, prop) {

  return function (val) {
    return component.setState(_defineProperty({}, prop.name, val));
  };
}

function _subscribe(observableStateList, callbacks) {

  observableStateList.forEach(function (obj, i) {
    return obj.observable.onValue(callbacks[i]);
  });
}

function setupObservableState(component, observableStateList, initialState) {

  initialState = initialState || component.state || {};

  var callbacks = observableStateList.map(function (prop) {
    return _callback(component, prop);
  });

  //set default state first before setting up listeners
  component.setState(initialState, function () {
    return _subscribe(observableStateList, callbacks);
  });

  return callbacks;
}

function removeObservableState(observableStateList, callbacks) {

  observableStateList.forEach(function (obj, i) {
    return obj.observable.offValue(callbacks[i]);
  });
}

function observableState(state) {

  return Object.keys(state).filter(function (prop) {
    return (0, _isObservable2.default)(state[prop]);
  }).map(function (prop) {
    return { name: prop, observable: state[prop] };
  }) || [];
}

function nonObservableState(state) {

  return Object.keys(state).filter(function (prop) {
    return !(0, _isObservable2.default)(state[prop]) && prop !== 'children';
  }).reduce(function (total, prop) {
    return Object.assign(total, _defineProperty({}, prop, state[prop]));
  }, {});
}
//# sourceMappingURL=ContainerHelpers.js.map
