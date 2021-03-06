import assert from '../internal/assert'
import checkUnique from '../internal/checkUnique'

import {bindActionFunctions} from './createChannels'


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

function _bindSagaHandlers(channel, ActionTypes, SagaHandlers) {

  return AppDispatcher =>

    Object.keys(ActionTypes).reduce(
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
 * Sagas are primarily used for handling ajax workflows.
 *
 * @param {Object} opts
 * @param {string} opts.channel - the name of the saga collection
 * @param {Map<string,*>} opts.ActionTypes - the names of the action types (aka side
 * effects) these sagas handle
 * @param {Map<ActionType,Function>} opts.SagaActionFunctions - (optional) map of action
 * functions indexed by ActionType. Like a channel's action functions, these functions
 * can be used to initiate a saga. Note that if you include one action function, then
 * every ActionType must have a corresponding action function.
 * @param {Function} opts.SagaHandlersFn - higher order function with signature
 * `({...sagaInterface})=>SagaHandlers` that accepts the `sagas` interface object and
 * returns the SagaHandlers. The SagaHandlers are a map of functions indexed by
 * ActionType i.e, Map<ActionType,Function>.
 * @return {Saga} higher order function that creates the saga.
 * @private
 */
export function _createSagas({channel, ActionTypes, SagaActionFunctions = {}, SagaHandlersFn}) {

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(ActionTypes, 'Need ActionTypes')
  assert(SagaHandlersFn, 'Need SagaHandlersFn')
  assert(typeof SagaHandlersFn === 'function', 'SagaHandlersFn should be a higher order function')

  return ({AppDispatcher, sagaInterface}) => {

    /* eslint-disable new-cap */
    const SagaHandlers = SagaHandlersFn({...sagaInterface})
    /* eslint-enable */

    //every side effect must map to an action function and handler
    Object.keys(ActionTypes).forEach(action => {
      if (SagaActionFunctions) {
        assert(
          SagaActionFunctions[action],
          `Channel ${channel} is missing side effect action function "${action}"`
        )
      }
      assert(SagaHandlers[action], `Channel ${channel} is missing side effect handler "${action}"`)
    })

    const observables = _bindSagaHandlers(channel, ActionTypes, SagaHandlers)(AppDispatcher)

    return {
      name: channel,
      observables,
      actionFunctions: bindActionFunctions(ActionTypes, SagaActionFunctions)(AppDispatcher),
      resultObservables: _bindSagaResultObservables(observables)
    }
  }
}


export default function createSagas({rawSagas, ...args}) {
  checkUnique(rawSagas, 'channel', 'Cannot have two sagas with the same name')
  return rawSagas.map(s => _createSagas(s)({...args}))
}
