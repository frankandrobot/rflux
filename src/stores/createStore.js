import cast from '../internal/cast'
import assert from '../internal/assert'

import StateWithSideEffects from './StateWithSideEffects'
import {state} from './StateWithSideEffects'


function _bindActionFunctionToAppDispatcher(actionFunction) {

  return AppDispatcher =>
    (...args) => AppDispatcher.emit({...actionFunction(...args)})
}

/**
 * Takes a map of ActionFunctions indexed by Action and binds each to the
 * AppDispatcher. That is, when a bound function is called, it automatically
 * dispatches its message to the store.
 *
 * TODO global rename Action => ActionType
 *
 * **Note:**
 * 1. This method is actually a higher order function. It returns a function
 *    that accepts the AppDispatcher object as a parameter. This way, the
 *    AppDispatcher is not hard-coded dependency.
 *
 * @param {Map<String,Boolean>} Actions
 * @param {Map<Action,Function>} ActionFunctions
 * @returns {Function} a function that binds the action functions to the app dispatcher
 */
export function bindActionFunctions(Actions, ActionFunctions) {

  return AppDispatcher =>

    Object.keys(Actions).reduce(
      (storeActions, action) => ({
        ...storeActions,
        [action]: _bindActionFunctionToAppDispatcher(ActionFunctions[action])(AppDispatcher)
      }),
      {}
    )
}

/**
 * @deprecated You rarely (really) need a *pre-bound* selector (emphasis:
 * "pre-bound"). For this reason, these are deprecated.
 *
 * Takes a map of ActionObservables *not necessarily indexed by Action* and binds each
 * to the StoreObservable. The StoreObservable is the store's state, wrapped in a
 * Kefir stream (otherwise known as an *observable*).
 *
 * Since the StoreObservable represents the state, an ActionObservable is a way of
 * observing (aka "selecting") arbitrary parts of the state tree.
 *
 * **Note:**
 * 1. This method is actually a higher order function. It returns a function
 *    that accepts a StoreObservable object as a parameter. This way, the
 *    StoreObservable is not hard-coded dependency.
 *
 * TODO global rename StoreObservable => StateObservable
 * TODO global rename ActionObservable => SelectionObservable
 *
 * @param {Map<String,Observable>} ActionObservables
 * @returns {Function} a function that binds the action observables to the store observable
 * @private
 */
function _bindActionObservables(ActionObservables) {

  return storeObservable =>

    Object.keys(ActionObservables).reduce(
      (total, observable) => Object.assign(
        total,
        {[observable]: ActionObservables[observable](storeObservable)}
      ),
      {}
    )
}

/**
 * Creates the store's state observable using the given channel name.
 *
 * When an action comes in, it will call the corresponding reducer with the payload,
 * and pass the new state to the observable.
 *
 * Every reducer is called with these parameters:
 * 1. the current state
 * 2. the action payload
 * 3. a `endOfSideEffects` function that can be used to report the end of all the
 * side effects.
 *
 * In addition to updating the state, every reducer can also dispatch side
 * effects---which are just messages that are handled by other reducers or sagas. By
 * using the result of the `endOfSideEffects` function as the last side effect, it is
 * possible to tell when the entire reducer workflow completes... or so that's the
 * idea.
 *
 * Each reducer has this signature:
 *
 * ```
 * (state:StoreState, payload:Payload, endOfSideEffects:Payload => Message)
 * => StateWithSideEffects
 * ```
 *
 * TODO sideEffectResult may not actually fire correctly, specially when side effects
 * are handled by async sagas.
 *
 * **Notes:**
 * 1. Every Action must have a corresponding Reducer.
 * 2. This method is actually a higher order function. It returns a function
 *    that accepts an AppDispatcher object as a parameter. This way, the
 *    AppDispatcher is not hard-coded dependency.
 *
 * @param {String} channel
 * @param {Map<Action,Function>} Reducers
 * @returns {Function} a function that creates the store's state observable.
 */
function _createStoreObservable(channel, Reducers) {

  return AppDispatcher =>

    AppDispatcher
      .filter(x => x && x.channel === channel)
      .scan(
        (stateWithSideEffects, action) => {

          const reducer = Reducers[action.actionType]

          if (!reducer) {
            throw new Error(`Channel ${channel} does not support ${action.actionType}`)
          }

          const endOfSideEffects = payload => ({
            channel: `${channel}Result`,
            actionType: `${action.actionType}Result`,
            payload
          })

          // always return a StateWithSideEffects (code hardening)
          return cast(
            reducer(stateWithSideEffects.state, action.payload, endOfSideEffects),
            StateWithSideEffects
          )
        },
        state(Reducers.initialState || {})
        )
}


/**
 * The idea is that you can use these observables to observe the end of a reducer +
 * side effects.
 * @param {String} channel
 * @param {Map<String,*>} Actions
 * @returns {Function} function that binds AppDispatcher to the observables
 * @private
 */
function _createEndOfActionsObservables(channel, Actions) {

  return AppDispatcher =>

    Object.keys(Actions).reduce(
      (observables, action) => Object.assign(
        observables,
        {
          [`${action}ResultObservable`]:
            AppDispatcher
              .filter(x =>
              x.channel === `${channel}Result` && x.actionType === `${action}Result`)
              .map(x => x.payload)
        }
      ),
      {}
    )
}

/* eslint-disable no-console */
/**
 * The store consists of
 * - the channel name
 * - the state observable
 * - bound (aka "live") action functions
 * - bound state selectors (which will probably be deprecated in a future release)
 *
 * It is created from a map of the ActionTypes. Each ActionType has a corresponding
 * reducer, which handles incoming messages. Each ActionType also has a corresponding
 * ActionFunction that's used to dispatch messages.
 *
 * One catch is that the *names* of the ActionFunctions and the ActionObservables must
 * be globally unique. This isn't hard to achieve as long as you:
 *
 * 1. use the channel name in the action/observable. Ex: createDoc
 * 2. use the word "observable" in the observables. Ex: docObservable
 *
 * @param {String} channel
 * @param {Map<String,*>} Actions - map of action type constants
 * @param {Map<Action,Function>} Reducers - map of reducers, indexed by Action.
 * Additionally, reducers have an `initialState` property.
 * @param {Map<Action,Function>} ActionFunctions - map of action functions, indexed by
 * Action
 * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
 * that take the StoreObservable as input and return an observable that selects parts
 * of the state tree. **This will probably be deprecated.**
 * @returns {Function} that binds the store to the app dispatcher
 */
export default function createStore(
  channel,
  {Actions, Reducers, ActionFunctions, ActionObservables}) {

  ActionObservables = ActionObservables || {}

  assert(typeof channel === 'string', 'Needs a channel and it needs to be a string')
  assert(Actions, 'Need Actions')
  assert(Reducers, 'Need Reducers')
  assert(ActionFunctions, 'Need action functions')

  //every action must have an action function and a reducer
  Object.keys(Actions).forEach(action => {
    assert(
      ActionFunctions[action],
      `Channel ${channel} is missing action function "${action}"`
    )
    assert(Reducers[action], `Channel ${channel} is missing reducer "${action}"`)
  })

  //need an initial state; otherwise defaults to {}
  if (!Reducers.initialState) {
    console.warn(`Channel ${channel} doesn't have initialState`)
  }

  return AppDispatcher => {

    const stateWithSideEffectsObservable =
      _createStoreObservable(channel, Reducers)(AppDispatcher)
    const stateObservable = stateWithSideEffectsObservable.map(x => x.state)

    return {
      name: channel,
      stateWithSideEffectsObservable,
      store: {
        ...bindActionFunctions(Actions, ActionFunctions)(AppDispatcher),
        ..._bindActionObservables(ActionObservables)(stateObservable),
        /**
         * @deprecated
         */
        ..._createEndOfActionsObservables(channel, Actions)(AppDispatcher),
        [`${channel}Observable`]: stateObservable
      }
    }
  }
}
