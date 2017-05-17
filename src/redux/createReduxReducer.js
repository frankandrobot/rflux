import cast from '../internal/cast'
import assert from '../internal/assert'

import StateWithSideEffects from '../stores/StateWithSideEffects'
import {state} from '../stores/StateWithSideEffects'


function _createReduxReducerStateObservable(channel, Reducers) {

  const reducerKeys = Object.keys(Reducers)

  return AppDispatcher =>

    AppDispatcher
      .filter(x => x && x.channel === channel)
      .scan(
        (stateWithSideEffects, action) => {

          const newFullState = {}

          for(let i=0; i<reducerKeys; i++) {
            const reducerKey = reducerKeys[i]
            const reducer = Reducers[reducerKey]
            const newState = reducer(
              stateWithSideEffects.state[reducerKey],
              action.payload
            )

            newFullState[reducerKey] = newState
          }

          // always return a StateWithSideEffects (code hardening)
          return cast(
            newFullState,
            StateWithSideEffects
          )
        },
        state()
      )
}


/**
 * Creates a special channel for redux reducers. The main difference between this and
 * `createStores` is that the latter assumes a single reducer per action type. The
 * redux channel passes all actions to *every* reducer, as per the redux style.
 * Currently, `redux#combineReducers` is not supported.
 * @param {Map<String,Function>} Reducers
 * @returns {Function} the redux reducers channel
 */
export function createReduxReducer({Reducers}) {

  assert(Reducers, 'Need Reducers')

  return ({AppDispatcher}) => {

    const reduxChannelName = 'redux'
    const stateWithSideEffectsObservable =
      _createReduxReducerStateObservable(reduxChannelName, Reducers)(AppDispatcher)
    const stateObservable = stateWithSideEffectsObservable.map(x => x.state)

    return {
      name: reduxChannelName,
      stateWithSideEffectsObservable,
      store: {
        reduxObservable: stateObservable
      }
    }
  }
}
