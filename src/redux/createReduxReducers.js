import assert from '../internal/assert'

import {state} from '../stores/StateWithSideEffects'

import reduxChannelName from './reduxChannelName'


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

          // note how this returns a normal JS object. That means "state" in this
          // stream is just a normal JS object.
          return newFullState
        },
        {}
      )
}


/**
 * Creates a special channel for redux reducers. The main differences between this and
 * `createStores` are:
 *
 * 1. `createStores` assumes a single reducer per action type. `createReduxReducers`
 *    passes all actions to *every* reducer, as per the redux style.
 * 2. `createStores` maps each channel to a single top-level state property.
 *    `createReduxReducers` maps every reducer to a top-level state property. But
 *     internally, all messages flow through a single redux channel.
 *
 * ## Limitations
 *
 * Currently, `redux#combineReducers` is not supported.
 *
 * ## Message Dispatching
 *
 * To pass a message to a redux reducer from an rflux app, use this format:
 * - channel:String = reduxChannelName (see ./reduxChannelName)
 * - actionType:String
 * - payload: {//actual redux action }
 *
 * @param {Map<String,Function>} Reducers
 * @returns {Function} the redux reducers channel
 */
export default function createReduxReducers({Reducers, AppDispatcher}) {

  assert(Reducers, 'Need Reducers')

  const combinedStateObservable =
    _createReduxReducerStateObservable(reduxChannelName, Reducers)(AppDispatcher)

  return Object.keys(Reducers)
    .map(reducerKey => {
      const reducerStateObservable = combinedStateObservable
        .map(combinedState => combinedState[reducerKey])
        // eslint-disable-next-line eqeqeq
        .skipDuplicates((prev, next) => prev == next)

      return {
        name: reducerKey,
        stateWithSideEffectsObservable:
          reducerStateObservable.map(reducerState => state(reducerState)),
        store: {
          [`${reducerKey}Observable`]: reducerStateObservable
        }
      }
    })
}
