import Kefir from 'kefir'

import createAppDispatcher from './appdispatcher/createAppDispatcher'
import createStore from './stores/createStore'
import createSagas from './stores/createSagas'
import sagaFactory from './stores/sagaFactory'


export default function appStateFactory(middleware = []) {
  const AppState = {}
  const stores = []
  const sagas = []
  const AppDispatcher = createAppDispatcher()

  /* eslint-disable no-use-before-define */
  return {
    /**
     *
     * This actually creates _and_ registers a store.
     *
     * @param {String} channel
     * @param {Map<String,*>} ActionTypes - map of action types
     * @param {Map<ActionType,Function>} Reducers - map of reducers indexed by ActionType
     * @param {Map<ActionType,Function>} ActionFunctions - map of action functions indexed by
     * ActionTypes
     * @param {Map<String,Function>} ActionObservables (optional) - higher order functions
     * that take the StoreStateObservable as input and return an observable that selects parts
     * of the state tree. **This will probably be deprecated.**
     * @function
     */
    registerStore: _registerStore({AppState, stores, AppDispatcher}),
    registerSagas: _registerSagas({AppState, sagas, AppDispatcher}),
    sagas: sagaFactory(AppDispatcher),
    create: _create({AppState, stores, AppDispatcher}),

    get _stores() { return stores },
    get _sagas() { return sagas }
  }
}

function _registerStore({AppState, stores, AppDispatcher}) {
  return function __registerStore(
    channel,
    {ActionTypes, Reducers, ActionFunctions, ActionObservables}) {

    // first create the store
    const store = createStore(
      channel,
      {ActionTypes, Reducers, ActionFunctions, ActionObservables}
    )(AppDispatcher)

    // then add store to store info collection
    stores.push(store)

    // then create the new appStateObservable
    const stateWithSideEffectsObservables =
      stores.map(x => x.stateWithSideEffectsObservable)
    const appStateObservable = Kefir.combine(
      // this fires when any of the store state observables change
      stateWithSideEffectsObservables,
      // this combines all the store states into a single state
      (...observables) => observables.reduce(
        (appStateObservable, state, i) => Object.assign(
          appStateObservable,
          {[`${stores[i].name}`]: state.state}
        ),
        {}
      )
    )

    // new app state is observable + store
    Object.assign(AppState, {appStateObservable, ...store.store})
  }
}


export function _registerSagas({AppState, sagas, AppDispatcher}) {
  return function __registerSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers}) {

    const _sagas = createSagas(channel, {Sagas, SagaActionFunctions, SagaHandlers})(AppDispatcher)

    // store
    sagas.push(_sagas)

    // add action functions and result observables to app state
    Object.assign(AppState, _sagas.actionFunctions, _sagas.resultObservables)

    // setup one-way data flow
    const callback = () => undefined

    Object.keys(_sagas.observables).forEach(obs => _sagas.observables[obs].onValue(callback))
  }
}


export function _create({AppState, stores, AppDispatcher}) {
  return function __create() {
    if (stores.length === 0) {
      throw new Error('You didn\'t register any stores!')
    }

    // setup one-way data flow + side effects
    stores.map(store => store.stateWithSideEffectsObservable.onValue(state =>
      (state.sideEffects || []).forEach(
        sideEffect => setTimeout(() => AppDispatcher.emit(sideEffect), 0)
      )
    ))

    return AppState
  }
}
