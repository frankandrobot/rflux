import Kefir from 'kefir'

import kefirEmitter from '../utils/kefirEmitter'
import isObservable from '../internal/isObservable'
import uuid from '../internal/uuid'

import AppDispatcher from './../appdispatcher/AppDispatcher'


export const sideEffects = kefirEmitter()



const callObservable = sideEffects
  .filter(action => action.action === 'CALL')
  .map(action => action.payload)
  .flatMap(action => {

    const callId = action.callId
    const result = action.fn(...action.args)
    const resultObservable = isObservable(result) ? result : Kefir.constant(result)

    return resultObservable.map(rslt => ({callId, rslt}))
  })
  .onValue(() => undefined)

export function put(action) {

  setTimeout(() => AppDispatcher.emit(action), 0)

  return Kefir.constant(action) // streamified so we can chain together
}

export function call(fn, ...args) {

  const callId = uuid()

  setTimeout(() => sideEffects.emit({action: 'CALL', payload: {fn, args, callId}}), 0)

  return callObservable.filter(fn => fn.callId === callId).map(fn => fn.rslt).take(1)
}

export function listen(channel, actionType) {

  return AppDispatcher
    .filter(action => action.channel === channel && action.actionType === actionType)
    .map(action => action.payload)
}
