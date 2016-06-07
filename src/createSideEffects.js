import assert from './support/assert'

import {result} from './Saga'
import {bindActionFunctions} from './createStore'


function _bindSideEffectsObservable(channel, SideEffectHandlers) {

  return (AppDispatcher, AppState) =>

    AppDispatcher
      .filter(x => x.channel === channel)
      .flatMap(action => {

        const handler = SideEffectHandlers[action.actionType]

        if (!handler) {
          throw new Error(`Channel ${channel} does not support side effect "${action.actionType}"`)
        }

        return handler(action.payload, AppState, result(action.__sideEffectCallId))
      })
}

export default function createSideEffects(channel, {SideEffects, SideEffectActionFunctions, SideEffectHandlers}) {

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(SideEffects, 'Need SideEffects')
  assert(SideEffectActionFunctions, 'Need SideEffectActionFunctions')
  assert(SideEffectHandlers, 'Need SideEffectHandlers')

  //every side effect must map to an action function and handler
  Object.keys(SideEffects).forEach(action => {
    assert(SideEffectActionFunctions[action], `Channel ${channel} is missing side effect action function for ${action}`)
    assert(SideEffectHandlers[action], `Channel ${channel} is missing side effect handler for ${action}`)
  })

  return (AppDispatcher, AppState) => ({
    name: channel,
    observable: _bindSideEffectsObservable(channel, SideEffectHandlers)(AppDispatcher, AppState),
    sideEffects: bindActionFunctions(SideEffectActionFunctions)(AppDispatcher)
  })
}
