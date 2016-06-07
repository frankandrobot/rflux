import {Channels, ActionTypes} from './Constants'


export function systemBroadcastResult(result) {

  return {
    channel: Channels.system,
    actionType: ActionTypes.result,
    payload: result
  }
}
