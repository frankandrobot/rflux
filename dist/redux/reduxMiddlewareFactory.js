'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = middlewareFactory;

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function middlewareFactory(_ref) {
  var dispatch = _ref.dispatch,
      rawMiddleware = _ref.rawMiddleware;


  var state = null;
  var store = {
    dispatch: dispatch,
    getState: function getState() {
      return state;
    }
  };
  var middleware = rawMiddleware.map(function (__middleware) {
    return __middleware(store);
  });

  return {
    setState: function setState(_state) {
      return state = _state;
    },

    attachMiddleware: function attachMiddleware(_ref2) {
      var AppDispatcher = _ref2.AppDispatcher;

      var AppDispatcherObs =
      // this injects the middleware into the AppDispatcher. Middleware can stop propagation of events
      // to observables by not calling "next(action)". Middleware can also transform actions or dispatch
      // their own actions.
      AppDispatcher.flatMap(function (action) {
        return middleware.reduce(function (chain, _middleware) {
          var transformedAction = action;
          var allowContinue = false;
          // the "next" action doesn't actually do anything.... it just tells the chain of
          // filters to continue. Also allows the middleware to transfom the action
          var next = function next(_action) {
            transformedAction = _action;
            allowContinue = true;
          };

          return chain.filter(function (_action) {
            _middleware(next)(_action);
            // stop if next not called
            return allowContinue;
          })
          // transform action (if requested)
          .map(function () {
            return transformedAction;
          });
        }, _kefir2.default.constant(action));
      });

      // Yuck. Turn the observer into a dispatcher by adding an emit method that dispatches events into
      // the *original* AppDispatcher bus. Recall that the AppDispatcher is a bus (an observable with an emit
      // method).
      Object.assign(AppDispatcherObs, { emit: function emit() {
          return AppDispatcher.emit.apply(AppDispatcher, arguments);
        } });

      return AppDispatcherObs;
    }
  };
}
//# sourceMappingURL=reduxMiddlewareFactory.js.map
