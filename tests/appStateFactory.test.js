/* eslint func-names:0 */
import test from 'tape'

import keyMirror from 'keymirror'

import appStateFactory from '../src/appStateFactory'


const objectUnderTestFn = () => {
  const store1 = {
    channel: 'store1',
    ActionTypes: keyMirror({
      action1: true
    }),
    Reducers: {
      action1: (state, action) => action,
      initialState: {}
    },
    ActionFunctions: {
      action1: x => ({channel: 'store1', actionType: 'action1', payload: {...x}})
    }
  }
  const store2 = {
    channel: 'store2',
    ActionTypes: keyMirror({
      action2: true
    }),
    Reducers: {
      action2: (state, action) => action,
      initialState: {}
    },
    ActionFunctions: {
      action2: x => ({channel: 'store2', actionType: 'action2', payload: {...x}})
    }
  }
  const factory = appStateFactory({
    stores: [store1, store2]
  })

  const AppState = factory.create()

  return {
    AppState
  }
}


test('AppState has appStateObservable', function(t) {
  t.plan(1)
  const {AppState} = objectUnderTestFn()

  t.ok(!!AppState.appStateObservable, 'appStateObservable is defined')
})


test('AppState has action functions', function(t) {
  t.plan(2)
  const {AppState} = objectUnderTestFn()

  t.ok(!!AppState.action1)
  t.ok(!!AppState.action2)
})


test('AppState has individual store state observables', function(t) {
  t.plan(2)
  const {AppState} = objectUnderTestFn()

  t.ok(!!AppState.store1Observable)
  t.ok(!!AppState.store2Observable)
})


test('AppState observable autofires initial state', function(t) {
  t.plan(1)
  const {AppState} = objectUnderTestFn()

  AppState.appStateObservable
    .onValue(state =>
      t.deepEqual(state, {
        store1: {},
        store2: {}
      })
    )
})


test('AppState observable works', function(t) {
  t.plan(1)
  const {AppState} = objectUnderTestFn()

  AppState.appStateObservable
    .skip(1) // skip initial state
    .onValue(state =>
      t.deepEqual(state, {
        store1: {msg: 'new state'},
        store2: {}
      })
    )

  AppState.action1({msg: 'new state'})
})


test('AppState has individual working observables', function(t) {
  t.plan(1)
  const {AppState} = objectUnderTestFn()

  AppState.store1Observable.skip(1).onValue(state =>
    t.deepEqual(state, {msg: 'new state'})
  )
  // this one shouldn't fire
  AppState.store2Observable.skip(1).onValue(state =>
    t.equal(0, 1)
  )
  AppState.action1({msg: 'new state'})
})

