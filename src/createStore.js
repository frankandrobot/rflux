import cast from './support/cast'
import assert from './support/assert'

import {StateWithSideEffects} from './StateWithSideEffects'


function _bindActionFunctionToAppDispatcher(AppDispatcher, actionFunction) {

  return (...args) => AppDispatcher.emit({...actionFunction(...args)})
}

/**
 * Returns a function that binds the action functions to the app dispatcher.
 * This way AppDispatcher isn't a hard-coded dependency.
 *
 * @param ActionFunctions
 * @returns {Function}
 * @private
 */
export function bindActionFunctions(ActionFunctions) {

  return AppDispatcher =>

    Object.keys(ActionFunctions).reduce(
      (storeActions, action) =>
        ({...storeActions, [action]: _bindActionFunctionToAppDispatcher(AppDispatcher, ActionFunctions[action])}),
      {}
    )
}

/**
 * Returns a function that binds the action observables to the store observable.
 * Action observables can give you a fine grain view of a store's state.
 *
 * You always have the storeObservable which is the top-level state view of the entire store.
 *
 * @param ActionObservables
 * @returns {*}
 * @private
 */
function _bindActionObservables(ActionObservables) {

  return storeObservable =>

    Object.keys(ActionObservables).reduce(
      (total, observable) => Object.assign(total, {[observable]: ActionObservables[observable](storeObservable)}),
      {}
    )
}

/**
 * Returns a function that binds the AppDispatcher to the store observable.
 *
 * The store observable is made from the channel Reducers.
 * When an action comes in, it will call the corresponding reducer with the payload.
 *
 * Note: in order for this to work, every Action must have a Reducer of the same name
 *
 * @param channel
 * @param Actions
 * @param Reducers
 * @returns {Function}
 */
function _bindStoreObservable(channel, Reducers) {

  const initialState = Reducers.initialState || {}

  return AppDispatcher =>

    AppDispatcher
      .filter(x => x.channel === channel)
      .scan((state, action) => {

        const handler = Reducers[action.actionType]

        if (!handler) {
          throw new Error(`Channel ${channel} does not support ${action.actionType}`)
        }

        // always return a StateWithSideEffects
        return cast(handler(state, action.payload), StateWithSideEffects)

      }, initialState)
}

/**
 * The "store" is just the public interface used by the app. It consists of:
 *
 * - action functions (ex: DocActions) - this is what you call to initiate a store update
 * - action observables (optional) (ex: DocActionObservables) - this is how you know the store update completed.
 * - store observable - the store state
 *
 * **In order for this to work, every action function and action observable must be globally unique.**
 *
 * This isn't hard to achieve as long as you:
 * 1. use the storeStateName in the action/observable. Ex: createDoc
 * 2. use the word "observable" in the observables. Ex: docObservable
 *
 * @param storeName
 * @param channel
 * @param Actions
 * @param Reducers
 * @param ActionFunctions
 * @param ActionObservables (optional) - you always get one for free... the observable that listens to the entire store
 * @returns {{}}
 */
export default function createStore(channel, {Actions, Reducers, ActionFunctions, ActionObservables}) {

  ActionObservables = ActionObservables || {}

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(Actions, 'Need Actions')
  assert(Reducers, 'Need Reducers')
  assert(ActionFunctions, 'Need action functions')

  //every action must have an action function and a reducer
  Object.keys(Actions).forEach(action => {
    assert(ActionFunctions[action], `Channel ${channel} is missing action function for ${action}`)
    assert(Reducers[action], `Channel ${channel} is missing reducer for ${action}`)
  })

  //need an initial state; otherwise defaults to {}
  if (!Reducers.initialState) {
    console.warn(`Channel ${channel} doesn't have initialState`)
  }

  return AppDispatcher => {

    const storeWithSideEffectsObservable = _bindStoreObservable(channel, Reducers)(AppDispatcher)
    const storeObservable = storeWithSideEffectsObservable.map(x => x.state)

    return {
      name: channel,
      observable: storeWithSideEffectsObservable,
      store: {
        ...bindActionFunctions(ActionFunctions)(AppDispatcher),
        ..._bindActionObservables(ActionObservables)(storeObservable),
        [`${channel}Observable`]: storeObservable
      }
    }
  }
}
