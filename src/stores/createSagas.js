import assert from '../internal/assert'

import {bindActionFunctions} from './createStore'


export function bindSagaHandler(channel, sagaName, sagaHandler) {

  return AppDispatcher =>

    AppDispatcher
      .filter(x => x.channel === channel && x.actionType === sagaName)
      .flatMap(x => sagaHandler(x.payload))
      .map(result => {
        // emit the result back to the app dispatcher for time travel.
        setTimeout(() => AppDispatcher.emit({channel, actionType: `${sagaName}Result`, payload: result}), 0)
        return result
      })
}

function _bindSagaHandlers(channel, Sagas, SagaHandlers) {

  return AppDispatcher =>

    Object.keys(Sagas).reduce(
      (observables, saga) => {

        const handler = SagaHandlers[saga]
        const observable = bindSagaHandler(channel, saga, handler)(AppDispatcher)

        return Object.assign(observables, {[saga]: observable})
      },
      {}
    )
}

function _bindSagaResultObservables(sagas) {

  return Object.keys(sagas).reduce(
    (observables, saga) => Object.assign(observables, {[`${saga}ResultObservable`]: sagas[saga]}),
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

  return AppDispatcher => {

    const observables = _bindSagaHandlers(channel, Sagas, SagaHandlers)(AppDispatcher)

    return {
      name: channel,
      observables,
      actionFunctions: bindActionFunctions(Sagas, SagaActionFunctions)(AppDispatcher),
      resultObservables: _bindSagaResultObservables(observables)
    }
  }
}
