import reduxChannelName from './reduxChannelName'


export default function rfluxMessage(msg) {
  return {
    channel: reduxChannelName,
    actionType: msg.type,
    payload: msg
  }
}
