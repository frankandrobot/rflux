import Kefir from 'kefir'

import AppDispatcher from './appdispatcher/AppDispatcher'
import createStore from './stores/createStore'
import createSagas from './stores/createSagas'


const AppState = {}

const _storeInfo = []
const _sagaInfo = []

/**
 * This actually creates _and_ registers a store.
 *
 * @param {String} channel
 * @param {Map<String,*>} Actions - map of action types
 * @param {Map<Action,Function>} Reducers - map of reducers indexed by Action
 * @param {Map<Action,Function>} ActionFunctions - map of action functions indexed by
 * Actions
 * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
 * that take the StoreObservable as input and return an observable that selects parts
 * of the state tree. **This will probably be deprecated.**
 */
export function registerStore(
  channel, {Actions, Reducers, ActionFunctions, ActionObservables}) {

  const store = createStore(
    channel,
    {Actions, Reducers, ActionFunctions, ActionObservables}
  )(AppDispatcher)

  // add store to store info collection
  _storeInfo.push(store)

  // update app state observable with latest
  const storeStateObservables = _storeInfo.map(x => x.observable)
  const appStateObservable = Kefir.combine(
    // this fires when any of the store state observables change
    storeStateObservables,
    // this combines all the store states into a single state
    (...observables) => observables.reduce(
      (appStateObservable, storeState, i) => Object.assign(
        appStateObservable,
        {[`${_storeInfo[i].name}`]: storeState.state}
      ),
      {}
    )
  )

  Object.assign(AppState, {appStateObservable})

  // add store to AppState
  Object.assign(AppState, {...store.store})

  // setup one-way data flow + side effects
  store.observable.onValue(state =>
    (state.sideEffects || []).forEach(
      sideEffect => setTimeout(() => AppDispatcher.emit(sideEffect), 0)
    )
  )
}

export function registerSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers}) {

  const sagas = createSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers})(AppDispatcher)

  // store
  _sagaInfo.push(sagas)

  // add action functions and result observables to app state
  Object.assign(AppState, sagas.actionFunctions, sagas.resultObservables)

  // setup one-way data flow
  const callback = () => undefined

  Object.keys(sagas.observables).forEach(obs => sagas.observables[obs].onValue(callback))
}

export default AppState
