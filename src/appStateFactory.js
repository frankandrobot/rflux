import Kefir from 'kefir'

import createAppDispatcher from './appdispatcher/createAppDispatcher'
import createStore from './stores/createStore'
import createSagas from './stores/createSagas'
import middlewareFactory from './redux/middlewareFactory'


/**
 * A store consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Stores[]} stores
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 */
export default function appStateFactory(
  {
    stores: rawStores = [],
    sagas: rawSagas = [],
    middleware = []
  }) {

  /* eslint-disable no-use-before-define */
  if (rawStores.length === 0) {
    throw new Error('You didn\'t add any stores!')
  }
  const InitialAppDispatcher = createAppDispatcher()
  const dispatch = (...args) => InitialAppDispatcher.emit(...args)
  const Middleware = middlewareFactory({dispatch, rawMiddleware: middleware})
  const AppDispatcher = Middleware.attachMiddleware({AppDispatcher: InitialAppDispatcher})

  const stores = _createStores({rawStores, AppDispatcher})
  const sagas = _createSagas({rawSagas, AppDispatcher})
  const appStateObservable =
    _createAppStateObservable({stores})
    // inject the state back into Middleware, so that getState works. Unfortunately, in kefirjs, there is
    // no way to do a side effect w/o activating the stream. So we use `map` for side effects (which is
    // technically an antipattern).
      .map(state => { Middleware.setState(state); return state })

  _setupStoreObs({stores, AppDispatcher})
  _setupSagaObs({sagas})

  const AppState = {
    appStateObservable,
    ..._storesToState({stores}),
    ..._sagasToState({sagas})
  }

  return {
    AppState,
    AppDispatcher
  }
}

function _createStores({rawStores, AppDispatcher}) {
  return rawStores.map(s => createStore(s)(AppDispatcher))
}

function _createSagas({rawSagas, AppDispatcher}) {
  return rawSagas.map(s => createSagas(s)(AppDispatcher))
}

function _createAppStateObservable({stores}) {
  // first create the new appStateObservable
  const storeStatesWithSideEffectsObservables = stores.map(x => x.stateWithSideEffectsObservable)

  // then combine these into the appStateObservable
  return Kefir.combine(
    // this fires when any of the store state observables change
    storeStatesWithSideEffectsObservables,
    // this combines all the store states into a single state
    (...observables) => observables.reduce(
      (appStateObservable, state, i) => Object.assign(
        appStateObservable,
        {[`${stores[i].name}`]: state.state}
      ),
      {}
    )
  )
}

function _storesToState({stores}) {
  return stores.reduce((state, store) => ({...state, ...store.store}), {})
}

function _sagasToState({sagas}) {
  // add action functions and result observables to app state
  return sagas.reduce((state, saga) => ({...state, ...saga.actionFunctions, ...saga.resultObservables}), {})
}

function _setupStoreObs({stores, AppDispatcher}) {
  // setup one-way data flow + side effects
  stores.forEach(store => store.stateWithSideEffectsObservable.onValue(state =>
    (state.sideEffects || []).forEach(
      sideEffect => setTimeout(() => AppDispatcher.emit(sideEffect), 0)
    )
  ))
}

function _setupSagaObs({sagas}) {
  // setup one-way data flow
  sagas.forEach(_sagas =>
    Object.keys(_sagas.observables).forEach(obs => _sagas.observables[obs].onValue(() => undefined))
  )
}



