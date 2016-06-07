'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _kefirUtils = require('./support/kefirUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-use-before-define:0 */


/**
 * In the props you pass normal properties and observables.
 * The observables is where the magic is---for each observable, add a listener,
 * and set the state of the Container equal to the observed value.
 * For example, if props = {obs1: observable} and the observed values are a, b, c...,
 * then this.state.obs1 = a, b, c, ...
 * Container then passes this state to its child as props.
 *
 * There are several ways to solve the problem of passing observables to components:
 * 1. stores manage transient state
 * ```
 * const docStore = {
 *   docs: {},
 *   curDocUuid: null,
  *  newDocUui: null
 * }
 * ```
 * in the above, the docStore manages curDocUuid and newDocUuid. This seems like a job for the app
 *
 * 2. pass transient state view props to child components.
 *    This option is problematic when a *stream* is a function of a prop.
 *    The reason is because with each prop change, the previous observers need to be killed.
 *
 *    That's obviously bad and including Container makes for a hard-to-use API
 *
 * ```
 * export function docObservable(docsObservable) {

  return uuid =>
    docsObservable
      .map(state => state.docs[uuid])
      .filter(doc => doc)
  }
  ```
 * 3. create observables that return parent objects, then pick out desired object in View.
 *    The obvious downside is that the internals of the state leaks out into the View.
 *    This makes it harder to refactor.
 *
 * 4. use other store action observables in an action observable.
 *    This is a variation of #3. Indirect relationships are bad for maintainability.
 *
 * 5. the last option is to use a variation of #3. *Create helper methods that pick out desired properties from a
 *    parent object*.
 *
 * @deprecated use createContainer
 */

var Container = function (_React$Component) {
  _inherits(Container, _React$Component);

  function Container(props) {
    _classCallCheck(this, Container);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Container).call(this, props));
  }

  _createClass(Container, [{
    key: 'componentWillMount',
    value: function componentWillMount() {

      this.normalProps = _normalProps(this.props);
      _setupObservables(this, this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {

      this.normalProps = _normalProps(nextProps);

      //unsub previous
      _unsubscribe(this.observables, this.callbacks);

      //subscribe new
      _setupObservables(this, nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      _unsubscribe(this.observables, this.callbacks);
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

  return Container;
}(_react2.default.Component);

exports.default = Container;


function _setupObservables(component, props) {

  component.observables = _observables(props);
  component.callbacks = _callbacks(component, component.observables);
  component.setState(props.children.type.defaultProps || {}, function () {
    return _subscribe(component.observables, component.callbacks);
  });
}

function _observables(props) {

  return Object.keys(props).filter(function (prop) {
    return (0, _kefirUtils.isObservable)(props[prop]);
  }).map(function (prop) {
    return { property: prop, observable: props[prop] };
  }) || [];
}

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param component
 * @param observables
 * @private
 */
function _callbacks(component, observables) {

  return observables.map(function (obj) {
    return function (val) {
      component.setState(_defineProperty({}, obj.property, val));
    };
  });
}

function _subscribe(observables, callbacks) {

  observables.forEach(function (obj, i) {
    return obj.observable.onValue(callbacks[i]);
  });
}

function _unsubscribe(observables, callbacks) {

  observables.forEach(function (obj, i) {
    return obj.observable.offValue(callbacks[i]);
  });
}

function _normalProps(props) {

  return Object.keys(props).filter(function (prop) {
    return !(0, _kefirUtils.isObservable)(props[prop]) && prop !== 'children';
  }).reduce(function (total, prop) {
    return Object.assign(total, _defineProperty({}, prop, props[prop]));
  }, {});
}
//# sourceMappingURL=Container.js.map
