'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reduxMiddlewareFactory;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _assert = require('../internal/assert');

var _assert2 = _interopRequireDefault(_assert);

var _reduxChannelName = require('./reduxChannelName');

var _reduxChannelName2 = _interopRequireDefault(_reduxChannelName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This injects the middleware into the AppDispatcher. Middleware can stop propagation
 * of events to observables by not calling "next(action)". Middleware can also
 * transform actions or dispatch their own actions.
 * @param {kefirEmitter} AppDispatcher
 * @param {middleware[]} rawMiddleware
 * @returns {MiddlewareFactory} factory
 */
function reduxMiddlewareFactory(_ref) {
  var AppDispatcher = _ref.AppDispatcher,
      rawMiddleware = _ref.rawMiddleware;


  (0, _assert2.default)(AppDispatcher, 'Need an AppDispatcher');
  (0, _assert2.default)(rawMiddleware, 'Need rawMiddleware');

  var state = null;
  var reduxStore = {
    // transform redux-formatted message to rflux
    dispatch: function dispatch(args) {
      return AppDispatcher.emit({
        channel: _reduxChannelName2.default,
        actionType: (args || {}).type,
        payload: args
      });
    },
    getState: function getState() {
      return state;
    }
  };
  var middleware = rawMiddleware.map(function (__middleware) {
    return __middleware(reduxStore);
  });

  return {
    setState: function setState(_state) {
      return state = _state;
    },

    /**
     * This AppDispatcher is middleware aware.
     * @returns {kefirEmitter} the AppDispatcher
     **/
    appDispatcher: function appDispatcher() {
      var AppDispatcherObs = AppDispatcher.flatMap(function (rfluxAction) {
        return middleware.reduce(function (chain, _middleware) {
          var transformedReduxAction = void 0;
          var allowContinue = false;
          // the "next" action doesn't actually do anything.... it just tells the
          // chain of filters to continue. Also allows the middleware to transfom
          // the payload
          var next = function next(reduxAction) {
            transformedReduxAction = reduxAction;
            allowContinue = true;
          };

          return chain.filter(function (reduxAction) {
            _middleware(next)(reduxAction);
            // stop if next not called
            return allowContinue;
          })
          // transform action (if requested)
          .map(function () {
            return transformedReduxAction;
          });
        }, _kefir2.default.constant(rfluxAction.payload)).map(function (reduxAction) {
          return _extends({}, rfluxAction, { payload: reduxAction });
        });
      });

      // Yuck. Turn the observer into a dispatcher by adding an emit method that
      // dispatches events into the *original* AppDispatcher bus. Recall that the
      // AppDispatcher is a bus (an observable with an emit method).
      Object.assign(AppDispatcherObs, { emit: function emit() {
          return AppDispatcher.emit.apply(AppDispatcher, arguments);
        } });

      return AppDispatcherObs;
    }
  };
}
//# sourceMappingURL=reduxMiddlewareFactory.js.map
