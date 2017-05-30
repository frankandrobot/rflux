'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rfluxMessage;

var _reduxChannelName = require('./reduxChannelName');

var _reduxChannelName2 = _interopRequireDefault(_reduxChannelName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rfluxMessage(msg) {
  return {
    channel: _reduxChannelName2.default,
    actionType: msg.type,
    payload: msg
  };
}
//# sourceMappingURL=rfluxMessage.js.map
