/* eslint func-names:0 */
import test from 'tape'

import keyMirror from 'keymirror'

import appStateFactory from '../src/appStateFactory'


const objectUnderTestFn = () => {
  const channel1 = {
    channel: 'channel1',
    ActionTypes: keyMirror({
      action1: true
    }),
    Reducers: {
      action1: (state, action) => action,
      initialState: {}
    },
    ActionFunctions: {
      action1: x => ({channel: 'channel1', actionType: 'action1', payload: {...x}})
    }
  }
  const channel2 = {
    channel: 'channel2',
    ActionTypes: keyMirror({
      action2: true
    }),
    Reducers: {
      action2: (state, action) => action,
      initialState: {}
    },
    ActionFunctions: {
      action2: x => ({channel: 'channel2', actionType: 'action2', payload: {...x}})
    }
  }
  const {AppState} = appStateFactory({
    channels: [channel1, channel2]
  })

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


test('AppState has individual channel state observables', function(t) {
  t.plan(2)
  const {AppState} = objectUnderTestFn()

  t.ok(!!AppState.channel1Observable)
  t.ok(!!AppState.channel2Observable)
})


test('AppState observable autofires initial state', function(t) {
  const {AppState} = objectUnderTestFn()

  AppState.appStateObservable
    .onValue(state => {
      t.deepEqual(state, {
        channel1: {},
        channel2: {}
      })
      t.end()
    })
    .onError(() => t.fail())
})


test('AppState observable works', function(t) {
  const {AppState} = objectUnderTestFn()

  AppState.appStateObservable
    .skip(1) // skip initial state
    .onValue(state =>
      t.deepEqual(state, {
        channel1: {msg: 'new state'},
        channel2: {}
      })
    )
    .onValue(() => t.end())
    .onError(() => t.fail())

  AppState.action1({msg: 'new state'})
})


test('AppState has individual working observables', function(t) {
  t.plan(1)
  const {AppState} = objectUnderTestFn()

  AppState.channel1Observable.skip(1).onValue(state =>
    t.deepEqual(state, {msg: 'new state'})
  )
  // this one shouldn't fire
  AppState.channel2Observable.skip(1).onValue(state =>
    t.equal(0, 1)
  )
  AppState.action1({msg: 'new state'})
})

