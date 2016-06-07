'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.systemBroadcastResult = systemBroadcastResult;

var _Constants = require('./Constants');

function systemBroadcastResult(result) {

  return {
    channel: _Constants.Channels.system,
    actionType: _Constants.ActionTypes.result,
    payload: result
  };
}
//# sourceMappingURL=AppActions.js.map
