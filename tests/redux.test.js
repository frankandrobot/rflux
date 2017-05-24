/* eslint func-names:0 */
import test from 'tape'

import reduxChannelName from '../src/redux/reduxChannelName'

import appStateFactory from '../src/appStateFactory'


const objectUnderTestFn = () => {
  const reducers = {
    state1(state = {action1: false}, action) {
      if (action.type === 'action1') {
        return {action1: true}
      }
      return state
    },
    state2(state = {action2: false}, action) {
      if (action.type === 'action2') {
        return {action2: true}
      }
      return state
    }
  }
  const {AppState, AppDispatcher} = appStateFactory({
    redux: {
      reducers
    }
  })

  return {
    AppState,
    AppDispatcher
  }
}


test('Redux reducers have initial state', function(t) {
  const {AppState} = objectUnderTestFn()

  AppState.appStateObservable
    .onValue(state => {
      t.deepEqual(state, {
        state1: {action1: false},
        state2: {action2: false}
      })
      t.end()
    })
    .onError(() => t.fail())
})


test('Redux reducers can receive actions', function(t) {
  const {AppState, AppDispatcher} = objectUnderTestFn()

  AppState.appStateObservable
    .skip(1) // skip the initial state
    .onValue(state => {
      t.deepEqual(state, {
        state1: {action1: true},
        state2: {action2: false}
      })
      t.end()
    })
    .onError(() => t.fail())

  AppDispatcher.emit({
    channel: reduxChannelName,
    actionType: 'action1',
    payload: {type: 'action1'}
  })
})
