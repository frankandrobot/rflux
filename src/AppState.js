import Kefir from 'kefir'

import AppDispatcher from './appdispatcher/AppDispatcher'
import createStore from './stores/createStore'
import createSagas from './stores/createSagas'


const AppState = {}

const _storeInfo = []
const _sagaInfo = []

/**
 * See #createStore for docs.
 *
 * This creates the store, adds it to the store info collection,
 * then recreates the combined AppState observable (optional)
 *
 * @param storeName
 * @param channel
 * @param Actions
 * @param Reducers
 * @param ActionFunctions
 * @param ActionObservables
 */
export function registerStore(channel, {Actions, Reducers, ActionFunctions, ActionObservables}) {

  const store = createStore(channel, {Actions, Reducers, ActionFunctions, ActionObservables})(AppDispatcher)

  // add store to store info collection
  _storeInfo.push(store)

  // update app state observable with latest
  const storeObservables = _storeInfo.map(x => x.observable)
  const appStateObservable = Kefir.combine(storeObservables, (...observables) =>
    observables.reduce(
      (stores, store, i) => Object.assign(stores, {[`${_storeInfo[i].name}`]: store.state}), {}
    )
  )

  Object.assign(AppState, {appStateObservable})

  // add store to AppState
  Object.assign(AppState, {...store.store})

  // setup one-way data flow + side effects
  store.observable.onValue(state =>
    (state.sideEffects || []).forEach(sideEffect => setTimeout(() => AppDispatcher.emit(sideEffect), 0))
  )
}

export function registerSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers}) {

  const sagas = createSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers})(AppDispatcher)

  // store
  _sagaInfo.push(sagas)

  // add action functions to app state
  Object.assign(AppState, sagas.actionFunctions)

  // setup one-way data flow
  const callback = () => undefined

  Object.keys(sagas.observables).forEach(obs => sagas.observables[obs].onValue(callback))
}

export default AppState
