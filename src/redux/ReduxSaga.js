import assert from '../internal/assert'

import Kefir from 'kefir'

import kefirEmitter from '../utils/kefirEmitter'
import isObservable from '../internal/isObservable'
import uuid from '../internal/uuid'


export const fakeAppDispatcher = kefirEmitter()
export const sagaMessageBus = kefirEmitter()

/**
 * Call the action and return the result (as an observable)
 */
const callObservable = sagaMessageBus
  .filter(action => action.action === 'CALL')
  .map(action => action.payload)
  .flatMap(action => {

    const callId = action.callId
    const result = action.fn(...action.args)
    const resultObservable = isObservable(result) ? result : Kefir.constant(result)

    return resultObservable.map(rslt => ({callId, rslt}))
  })
  .onValue(() => undefined)

/**
 * @param {String} channel
 * @param {Map} ActionTypes - map whose keys are the names of the side effects
 * @param {Map} SagaActionFunctions - (optional) map of action functions
 * @param {Map} SagaHandlers - map of handler functions
 * @returns {Object} redux middleware
 */
export function reduxSagaMiddleware(channel, {ActionTypes, SagaActionFunctions, SagaHandlers}) {

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(ActionTypes, 'Need ActionTypes')
  assert(SagaHandlers, 'Need SagaHandlers')

  //every side effect must map to an action function and handler
  Object.keys(ActionTypes).forEach(action => {
    if (SagaActionFunctions) {
      assert(SagaActionFunctions[action], `Channel ${channel} is missing side effect action function "${action}"`)
    }
    assert(SagaHandlers[action], `Channel ${channel} is missing side effect handler "${action}"`)
  })

  SagaActionFunctions = SagaActionFunctions || {}

  return () => next => action => {

    setTimeout(() => SagaHandlers[action.type](action), 0)
    setTimeout(() => fakeAppDispatcher.emit(action), 0)

    return next(action)
  }
}

export class ReduxSaga {

  constructor(channel) {

    this.channel = channel
  }

  put(action) {
    setTimeout(() => this.channel.dispatch(action), 0)

    return Kefir.constant(action) // streamified so we can chain together
  }

  call(fn, ...args) {

    const callId = uuid()

    setTimeout(() => sagaMessageBus.emit({action: 'CALL', payload: {fn, args, callId}}), 0)

    return callObservable.filter(fn => fn.callId === callId).map(fn => fn.rslt).take(1)
  }

  listen(channel, actionType) {

    return fakeAppDispatcher
      .filter(action => action.channel === channel && action.actionType === actionType)
      .map(action => action.payload)
  }
}
