import uuid from 'uuid'
import Kefir from 'kefir'

import kefirEmitter from '../utils/kefirEmitter'
import isObservable from '../internal/isObservable'

import AppDispatcher from './../appdispatcher/AppDispatcher'
import {Channels, ActionTypes} from './../Constants'


export const sideEffects = kefirEmitter()

const callObservable = sideEffects
  .filter(action => action.action === 'CALL')
  .map(action => action.payload)
  .flatMap(action => {

    const uuid = action.uuid
    const result = action.fn(...action.args)
    const resultObservable = isObservable(result) ? result : Kefir.constant(result)

    return resultObservable.map(rslt => ({uuid, rslt}))
  })
  .onValue(() => undefined)

export function put(action) {

  setTimeout(() => AppDispatcher.emit(action), 0)

  return Kefir.constant(action) // streamified so we can chain together
}

export function call(fn, ...args) {

  const id = uuid.v4()

  setTimeout(() => sideEffects.emit({action: 'CALL', payload: {fn, args, uuid: id}}), 0)

  return callObservable.filter(fn => fn.uuid === id).map(fn => fn.rslt).take(1)
}

export function result(__sideEffectCallId) {

  return rslt => {

    const action = {
      channel: Channels.system,
      actionType: ActionTypes.sideEffectResult,
      __sideEffectCallId,
      payload: rslt
    }

    setTimeout(() => sideEffects.emit({action: 'PUT', payload: action}), 0)

    return rslt
  }
}

export function listen(channel, actionType) {

  return AppDispatcher
    .filter(action => action.channel === channel && action.actionType === actionType)
    .map(action => action.payload)
}
