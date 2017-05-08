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
    spyOnAppDispatcher: function spyOnAppDispatcher(_ref2) {
      var AppDispatcher = _ref2.AppDispatcher;

      return AppDispatcher
      // this turns the middlewares into a stream of filters
      .flatMap(function (action) {
        return middleware.reduce(function (chain, _middleware) {
          var transformedAction = action;
          var allowContinue = false;
          // the "next" action doesn't actually do anything.... it just tells the chain of
          // filters to continue. But also allows the middleware to transfom the action
          var next = function next(_action) {
            transformedAction = _action;
            allowContinue = true;
          };

          return chain.filter(function (_action) {
            _middleware(next)(_action);
            return allowContinue;
          }).map(function () {
            return transformedAction;
          });
        }, _kefir2.default.constant(action));
      });
    }
  };
}
//# sourceMappingURL=middlewareFactory.js.map
