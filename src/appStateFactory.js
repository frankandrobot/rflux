import Kefir from 'kefir'

import checkUnique from './internal/checkUnique'
import createAppDispatcher from './appdispatcher/createAppDispatcher'
import createStores from './stores/createStores'
import createSagas from './stores/createSagas'
import sagaInterfaceFactory from './stores/sagaInterfaceFactory'
import reduxMiddlewareFactory from './redux/reduxMiddlewareFactory'
import createReduxReducers from './redux/createReduxReducers'


/**
 * A store consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * See `createStore` for more details.
 *
 * A saga consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - SagaHandlersFn higher order function that accepts a `sagas` interface and
 *   returns the SagaHandlers.
 *
 * See `createSagas` for more details.
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Stores[]} stores
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 * @returns {{AppState, AppDispatcher}} the AppState and its dispatcher to send messages.
 */
export default function appStateFactory(
  {
    stores: rawStores = [],
    sagas: rawSagas = [],
    redux: {middleware = [], reducers = {}} = {redux: {middleware: [], reducers: {}}}
  }) {

  /* eslint-disable no-use-before-define */
  // setup redux
  const Middleware = reduxMiddlewareFactory({
    AppDispatcher: createAppDispatcher(),
    rawMiddleware: middleware
  })
  const AppDispatcher = Middleware.appDispatcher()

  // setup public interface
  const reduxStore = createReduxReducers({Reducers: reducers, AppDispatcher})
  const stores = createStores({rawStores, AppDispatcher})
  const appStateObservable =
    _createAppStateObservable({stores: [...stores, ...reduxStore]})
    // inject the state back into Middleware, so that getState works. Unfortunately,
    // in kefirjs, there is no way to do a side effect w/o activating the stream. So
    // we use `map` for side effects (which is technically an antipattern).
      .map(state => {
        Middleware.setState(state)
        return state
      })
  const sagaInterface = sagaInterfaceFactory({AppDispatcher, appStateObservable})
  const sagas = createSagas({rawSagas, AppDispatcher, sagaInterface})

  checkUnique(
    [...rawStores, ...rawSagas, ...reducers],
    'channel',
    'Cannot have a store, saga, or redux reducer with the same name'
  )

  _setupStoreObs({stores: [...stores, ...reduxStore], AppDispatcher})
  _setupSagaObs({sagas})

  const AppState = {
    appStateObservable,
    ..._storesToState({stores: [...stores, ...reduxStore]}),
    ..._sagasToState({sagas})
  }
  /* eslint-enable */

  return {
    AppState,
    AppDispatcher
  }
}

function _createAppStateObservable({stores}) {
  // first create the new appStateObservable
  const storeStatesWithSideEffectsObservables =
    stores.map(x => x.stateWithSideEffectsObservable)

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



