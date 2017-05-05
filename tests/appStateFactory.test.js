/* eslint func-names:0 */
import test from 'blue-tape'

import keyMirror from 'keymirror'

import appStateFactory from '../src/appStateFactory'


const store1 = {
  Actions: keyMirror({
    action1: true
  }),
  Reducers: {
    action1: (state, action) => action,
    initialState: {}
  },
  ActionFunctions: {
    action1: x => ({type: 'action1', payload: {...x}})
  }
}
const store2 = {
  Actions: keyMirror({
    action2: true
  }),
  Reducers: {
    action2: (state, action) => action,
    initialState: {}
  },
  ActionFunctions: {
    action2: x => ({type: 'action2', payload: {...x}})
  }
}
const factory = appStateFactory()

factory.registerStore('store1', store1)
factory.registerStore('store2', store2)

const AppState = factory.create()


test('register two stores', function(t) {
  t.plan(1)
  t.equal(factory.stores.length, 2)
})

test('AppState has appStateObservable', function(t) {
  t.plan(1)
  t.ok(!!AppState.appStateObservable, 'appStateObservable is defined')
})

test('AppState has action functions', function(t) {
  t.plan(2)
  t.ok(!!AppState.action1)
  t.ok(!!AppState.action2)
})

test('AppState has individual store state observables', function(t) {
  t.plan(2)
  t.ok(!!AppState.store1Observable)
  t.ok(!!AppState.store2Observable)
})

test('AppState has a working observable', function(t) {
  t.plan(1)
  AppState.appStateObservable.onValue(state =>
    t.deepEqual(state, {
      store1: {},
      store2: {}
    })
  )
  AppState.action1()
})

test('AppState has individual working observables', function(t) {
  t.plan(1)
  AppState.appStateObservable.onValue(x => t.comment(x))
  AppState.store1Observable.onValue(state =>
    t.deepEqual(state, {msg: 'new state'})
  )
  // this one shouldn't fire
  AppState.store2Observable.onValue(state =>
    t.deepEqual(state, {})
  )
  AppState.action1({msg: 'new state'})
})

