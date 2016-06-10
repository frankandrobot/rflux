import assert from '../internal/assert'

import {bindActionFunctions} from './createStore'


export function bindSagaHandler(channel, sagaName, sagaHandler) {

  return AppDispatcher =>
  
    AppDispatcher
      .filter(x => x.channel === channel && x.actionType === sagaName)
      .flatMap(x => sagaHandler(x.payload))
}

function _bindSagaHandlers(channel, Sagas, SagaHandlers) {

  return AppDispatcher =>

    Object.keys(Sagas).reduce(
      (observables, handlerName) => {
        const handler = SagaHandlers[handlerName]
        const observable = bindSagaHandler(channel, handlerName, handler)(AppDispatcher)

        return Object.assign(observables, {[handlerName]: observable})
      },
      {}
    )
}

/**
  * SideEffectActionFunctions are optional but if you pass these,
  * then every SideEffect must have a corresponding action function.
  *
  * @param channel
  * @param Sagas - map whose keys are the names of the side effects
  * @param SagaActionFunctions - (optional) map of action functions
  * @param SagaHandlers - map of handler functions
  */
export default function createSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers}) {

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(Sagas, 'Need Sagas')
  assert(SagaHandlers, 'Need SagaHandlers')

  //every side effect must map to an action function and handler
  Object.keys(Sagas).forEach(action => {
    if (SagaActionFunctions) {
      assert(SagaActionFunctions[action], `Channel ${channel} is missing side effect action function "${action}"`)
    }
    assert(SagaHandlers[action], `Channel ${channel} is missing side effect handler "${action}"`)
  })

  SagaActionFunctions = SagaActionFunctions || {}

  return AppDispatcher => ({
    name: channel,
    observables: _bindSagaHandlers(channel, Sagas, SagaHandlers)(AppDispatcher),
    actionFunctions: bindActionFunctions(Sagas, SagaActionFunctions)(AppDispatcher)
  })
}
