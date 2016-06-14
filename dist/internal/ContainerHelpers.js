'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observables = observables;
exports.nonObservables = nonObservables;
exports.setupNonObservables = setupNonObservables;
exports.setupObservables = setupObservables;
exports.removeObservables = removeObservables;

var _isObservable = require('../internal/isObservable');

var _isObservable2 = _interopRequireDefault(_isObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function observables(stateOrProps) {

  return Object.keys(stateOrProps).filter(function (prop) {
    return (0, _isObservable2.default)(stateOrProps[prop]);
  }).map(function (prop) {
    return { name: prop, observable: stateOrProps[prop] };
  }) || [];
}

function nonObservables(stateOrProps) {

  return Object.keys(stateOrProps).filter(function (prop) {
    return !(0, _isObservable2.default)(stateOrProps[prop]) && prop !== 'children';
  }).reduce(function (total, prop) {
    return Object.assign(total, _defineProperty({}, prop, stateOrProps[prop]));
  }, {});
}

function setupNonObservables(component, stateOrProps) {
  var setState = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


  component._nonObservables = nonObservables(stateOrProps);

  setState && component.setState(component._nonObservables);
}

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param {React.Component} component
 * @param {*} prop
 * @returns {Function} callback
 * @private
 */
var _callback = function _callback(component, prop) {
  return function (val) {
    return component.setState(_defineProperty({}, prop.name, val));
  };
};
var _subscribe = function _subscribe(observableList, callbacks) {
  return observableList.forEach(function (obj, i) {
    return obj.observable.onValue(callbacks[i]);
  });
};
var _pluck = function _pluck(obj, keys) {
  return keys.reduce(function (culledObj, key) {
    return Object.assign(culledObj, _defineProperty({}, key, obj[key]));
  }, {});
};

function _setupObservableState(component, observableList, initialState) {

  initialState = initialState || component.state || {};

  var callbacks = observableList.map(function (prop) {
    return _callback(component, prop);
  });

  //set default state first before setting up listeners
  component.setState(_pluck(initialState, observableList.map(function (x) {
    return x.name;
  })), // set observables only
  function () {
    return _subscribe(observableList, callbacks);
  });

  return callbacks;
}

function setupObservables(component, stateOrProps) {

  component._observables = observables(stateOrProps);
  component._callbacks = _setupObservableState(component, component._observables);
}

function removeObservables(component) {

  var observables = component._observables;
  var callbacks = component._callbacks;

  observables.forEach(function (obj, i) {
    return obj.observable.offValue(callbacks[i]);
  });
}
//# sourceMappingURL=ContainerHelpers.js.map
