import assert from '../internal/assert'

import {state} from '../channels/StateWithSideEffects'

import reduxChannelName from './reduxChannelName'


function _createReduxReducerStateObservable(channel, Reducers) {

  const reducerKeys = Object.keys(Reducers)

  return AppDispatcher =>

    AppDispatcher
      .filter(x => x && x.channel === channel)
      .scan(
        (state, action) => {

          const newFullState = {}

          for(let i=0; i<reducerKeys.length; i++) {
            const reducerKey = reducerKeys[i]
            const reducer = Reducers[reducerKey]
            const newState = reducer(state[reducerKey], action.payload)

            newFullState[reducerKey] = newState
          }
          // note how this returns a normal JS object. That means "state" in this
          // stream is just a normal JS object.
          return newFullState
        },
        // the assumption is that if you invoke the reducer with no params, you will
        // get back the initial state.
        reducerKeys.reduce(
          (initialState, reducerKey) => Object.assign(
            initialState,
            {[reducerKey]: Reducers[reducerKey](undefined, {})}
          ),
          {}
        )
      )
}


/**
 * Creates a special channel for redux reducers. The main differences between this and
 * `createChannels` are:
 *
 * 1. `createChannels` assumes a single reducer per action type. `createReduxReducers`
 *    passes all actions to *every* reducer, as per the redux style.
 * 2. `createChannels` maps each channel to a single top-level state property.
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
 * @param {Map<string,Function>} Reducers
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
        // check that objects point to the same thing
        // eslint-disable-next-line eqeqeq
        .skipDuplicates((prev, next) => prev == next)

      return {
        name: reducerKey,
        stateWithSideEffectsObservable:
          reducerStateObservable.map(reducerState => state(reducerState)),
        observable: {
          [reducerKey]: reducerStateObservable,
        },
        channel: {}
      }
    })
}
